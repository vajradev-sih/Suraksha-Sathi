import { WorkerVideo } from '../models/workerVideo.model.js';
import { Like } from '../models/like.model.js';
import { Follow } from '../models/follow.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Smart recommendation algorithm based on:
 * 1. Videos from users you follow
 * 2. Videos liked by users you follow
 * 3. Popular videos in categories you've engaged with
 * 4. Trending videos (recent + high engagement)
 */
const getRecommendedVideos = asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const userId = req.user._id;

  // Get users that current user follows
  const following = await Follow.find({ follower_id: userId }).select('following_id');
  const followingIds = following.map(f => f.following_id);

  // Get videos current user has liked (to find preferred categories)
  const userLikes = await Like.find({ user_id: userId })
    .populate('video_id', 'category')
    .limit(50);
  const likedCategories = [...new Set(
    userLikes
      .filter(like => like.video_id)
      .map(like => like.video_id.category)
  )];

  // Get videos already seen by user (liked videos)
  const seenVideoIds = userLikes.map(like => like.video_id?._id).filter(Boolean);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const recommendations = [];

  // Strategy 1: Videos from followed users (30% weight)
  if (followingIds.length > 0) {
    const followedUsersVideos = await WorkerVideo.find({
      uploaded_by: { $in: followingIds },
      approval_status: 'approved',
      _id: { $nin: seenVideoIds }
    })
      .sort({ createdAt: -1, like_count: -1 })
      .limit(Math.ceil(parseInt(limit) * 0.3))
      .populate('uploaded_by', 'fullName email role_name');

    recommendations.push(...followedUsersVideos.map(v => ({ 
      ...v.toObject(), 
      recommendation_reason: 'From users you follow',
      recommendation_score: 5
    })));
  }

  // Strategy 2: Videos liked by users you follow (25% weight)
  if (followingIds.length > 0) {
    const followedUsersLikes = await Like.find({
      user_id: { $in: followingIds }
    })
      .populate({
        path: 'video_id',
        match: { 
          approval_status: 'approved',
          _id: { $nin: seenVideoIds }
        },
        populate: { path: 'uploaded_by', select: 'fullName email role_name' }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const likedByFollowing = followedUsersLikes
      .filter(like => like.video_id)
      .map(like => ({
        ...like.video_id.toObject(),
        recommendation_reason: 'Liked by users you follow',
        recommendation_score: 4
      }))
      .slice(0, Math.ceil(parseInt(limit) * 0.25));

    // Remove duplicates
    const existingIds = new Set(recommendations.map(v => v._id.toString()));
    likedByFollowing.forEach(video => {
      if (!existingIds.has(video._id.toString())) {
        recommendations.push(video);
        existingIds.add(video._id.toString());
      }
    });
  }

  // Strategy 3: Popular videos in user's preferred categories (25% weight)
  if (likedCategories.length > 0) {
    const categoryVideos = await WorkerVideo.find({
      category: { $in: likedCategories },
      approval_status: 'approved',
      _id: { $nin: seenVideoIds }
    })
      .sort({ like_count: -1, views: -1 })
      .limit(Math.ceil(parseInt(limit) * 0.25))
      .populate('uploaded_by', 'fullName email role_name');

    const existingIds = new Set(recommendations.map(v => v._id.toString()));
    categoryVideos.forEach(video => {
      if (!existingIds.has(video._id.toString())) {
        recommendations.push({
          ...video.toObject(),
          recommendation_reason: `Popular in ${video.category}`,
          recommendation_score: 3
        });
        existingIds.add(video._id.toString());
      }
    });
  }

  // Strategy 4: Trending videos (recent + high engagement) (20% weight)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const trendingVideos = await WorkerVideo.find({
    approval_status: 'approved',
    createdAt: { $gte: sevenDaysAgo },
    _id: { $nin: seenVideoIds }
  })
    .sort({ like_count: -1, views: -1, createdAt: -1 })
    .limit(Math.ceil(parseInt(limit) * 0.2))
    .populate('uploaded_by', 'fullName email role_name');

  const existingIds = new Set(recommendations.map(v => v._id.toString()));
  trendingVideos.forEach(video => {
    if (!existingIds.has(video._id.toString())) {
      recommendations.push({
        ...video.toObject(),
        recommendation_reason: 'Trending now',
        recommendation_score: 2
      });
      existingIds.add(video._id.toString());
    }
  });

  // If we don't have enough recommendations, fill with popular videos
  if (recommendations.length < parseInt(limit)) {
    const fillCount = parseInt(limit) - recommendations.length;
    const popularVideos = await WorkerVideo.find({
      approval_status: 'approved',
      _id: { $nin: seenVideoIds }
    })
      .sort({ like_count: -1, views: -1 })
      .limit(fillCount)
      .populate('uploaded_by', 'fullName email role_name');

    const existingIds = new Set(recommendations.map(v => v._id.toString()));
    popularVideos.forEach(video => {
      if (!existingIds.has(video._id.toString())) {
        recommendations.push({
          ...video.toObject(),
          recommendation_reason: 'Popular videos',
          recommendation_score: 1
        });
      }
    });
  }

  // Sort by recommendation score (higher is better)
  recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);

  // Apply pagination
  const paginatedRecommendations = recommendations.slice(skip, skip + parseInt(limit));

  // Add like status for current user
  const recommendationsWithLikeStatus = await Promise.all(
    paginatedRecommendations.map(async (video) => {
      const videoDoc = await WorkerVideo.findById(video._id);
      const isLiked = await videoDoc.isLikedBy(userId);
      return {
        ...video,
        is_liked: isLiked
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, {
      videos: recommendationsWithLikeStatus,
      total: recommendations.length,
      page: parseInt(page),
      total_pages: Math.ceil(recommendations.length / parseInt(limit))
    }, 'Recommended videos fetched successfully')
  );
});

/**
 * Get personalized feed for user
 * Similar to recommendations but optimized for infinite scroll
 */
const getPersonalizedFeed = asyncHandler(async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const userId = req.user._id;

  // Get following
  const following = await Follow.find({ follower_id: userId }).select('following_id');
  const followingIds = following.map(f => f.following_id);

  // Get recently liked videos to avoid showing them again
  const recentLikes = await Like.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .select('video_id');
  const seenVideoIds = recentLikes.map(like => like.video_id);

  // Build aggregation pipeline for personalized feed
  const feed = await WorkerVideo.aggregate([
    {
      $match: {
        approval_status: 'approved',
        _id: { $nin: seenVideoIds }
      }
    },
    {
      $addFields: {
        // Boost score for videos from followed users
        follow_boost: {
          $cond: [
            { $in: ['$uploaded_by', followingIds] },
            100,
            0
          ]
        },
        // Calculate engagement score
        engagement_score: {
          $add: [
            { $multiply: ['$like_count', 2] },
            { $multiply: ['$views', 0.1] }
          ]
        },
        // Recency score (newer videos get higher score)
        recency_score: {
          $divide: [
            { $subtract: [new Date(), '$createdAt'] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $addFields: {
        final_score: {
          $add: [
            '$follow_boost',
            '$engagement_score',
            { $divide: [1000, { $add: ['$recency_score', 1] }] } // Recency decay
          ]
        }
      }
    },
    { $sort: { final_score: -1 } },
    { $skip: parseInt(offset) },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'uploaded_by',
        foreignField: '_id',
        as: 'uploaded_by'
      }
    },
    { $unwind: '$uploaded_by' },
    {
      $project: {
        'uploaded_by.password': 0,
        'uploaded_by.refreshToken': 0,
        follow_boost: 0,
        engagement_score: 0,
        recency_score: 0,
        final_score: 0
      }
    }
  ]);

  // Add like status for each video
  const feedWithLikeStatus = await Promise.all(
    feed.map(async (video) => {
      const like = await Like.findOne({ user_id: userId, video_id: video._id });
      return {
        ...video,
        is_liked: !!like
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, {
      videos: feedWithLikeStatus,
      has_more: feed.length === parseInt(limit)
    }, 'Personalized feed fetched successfully')
  );
});

/**
 * Get similar videos based on a specific video
 */
const getSimilarVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { limit = 10 } = req.query;

  const video = await WorkerVideo.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Find similar videos based on:
  // 1. Same category
  // 2. Same uploader
  // 3. Similar engagement levels
  const similarVideos = await WorkerVideo.find({
    _id: { $ne: videoId },
    approval_status: 'approved',
    $or: [
      { category: video.category },
      { uploaded_by: video.uploaded_by }
    ]
  })
    .sort({ like_count: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate('uploaded_by', 'fullName email role_name');

  // Add like status for current user
  const videosWithLikeStatus = await Promise.all(
    similarVideos.map(async (vid) => {
      const isLiked = await vid.isLikedBy(req.user._id);
      return {
        ...vid.toObject(),
        is_liked: isLiked
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, videosWithLikeStatus, 'Similar videos fetched successfully')
  );
});

export {
  getRecommendedVideos,
  getPersonalizedFeed,
  getSimilarVideos
};
