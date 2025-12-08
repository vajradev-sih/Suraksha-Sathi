import { Like } from '../models/like.model.js';
import { WorkerVideo } from '../models/workerVideo.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Like a video
const likeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Check if video exists and is approved
  const video = await WorkerVideo.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (video.approval_status !== 'approved') {
    throw new ApiError(403, 'Cannot like videos that are not approved');
  }

  // Check if already liked
  const existingLike = await Like.findOne({
    user_id: req.user._id,
    video_id: videoId
  });

  if (existingLike) {
    throw new ApiError(400, 'You have already liked this video');
  }

  // Create like
  const like = await Like.create({
    user_id: req.user._id,
    video_id: videoId
  });

  // Increment like count on video
  video.like_count += 1;
  await video.save();

  res.status(201).json(
    new ApiResponse(201, { like, like_count: video.like_count }, 'Video liked successfully')
  );
});

// Unlike a video
const unlikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Find and delete the like
  const like = await Like.findOneAndDelete({
    user_id: req.user._id,
    video_id: videoId
  });

  if (!like) {
    throw new ApiError(404, 'Like not found - you have not liked this video');
  }

  // Decrement like count on video
  const video = await WorkerVideo.findById(videoId);
  if (video && video.like_count > 0) {
    video.like_count -= 1;
    await video.save();
  }

  res.status(200).json(
    new ApiResponse(200, { like_count: video?.like_count || 0 }, 'Video unliked successfully')
  );
});

// Get all videos liked by the current user
const getMyLikedVideos = asyncHandler(async (req, res) => {
  const likes = await Like.find({ user_id: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'video_id',
      populate: [
        { path: 'uploaded_by', select: 'fullName email role_name' },
        { path: 'approved_by', select: 'fullName email role_name' }
      ]
    });

  // Filter out likes where video was deleted
  const validLikes = likes.filter(like => like.video_id);
  const videos = validLikes.map(like => ({
    ...like.video_id.toObject(),
    liked_at: like.createdAt,
    is_liked: true
  }));

  res.status(200).json(
    new ApiResponse(200, videos, 'Liked videos fetched successfully')
  );
});

// Get users who liked a specific video
const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { limit = 50, page = 1 } = req.query;

  const video = await WorkerVideo.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const likes = await Like.find({ video_id: videoId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user_id', 'fullName email role_name');

  const totalLikes = await Like.countDocuments({ video_id: videoId });

  res.status(200).json(
    new ApiResponse(200, {
      likes: likes.map(like => ({
        user: like.user_id,
        liked_at: like.createdAt
      })),
      total: totalLikes,
      page: parseInt(page),
      total_pages: Math.ceil(totalLikes / parseInt(limit))
    }, 'Video likes fetched successfully')
  );
});

// Check if current user has liked a video
const checkLikeStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const like = await Like.findOne({
    user_id: req.user._id,
    video_id: videoId
  });

  res.status(200).json(
    new ApiResponse(200, { is_liked: !!like }, 'Like status checked')
  );
});

// Get popular videos (most liked)
const getPopularVideos = asyncHandler(async (req, res) => {
  const { limit = 20, category } = req.query;
  
  const filter = { approval_status: 'approved' };
  if (category) {
    filter.category = category;
  }

  const videos = await WorkerVideo.find(filter)
    .sort({ like_count: -1, views: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate('uploaded_by', 'fullName email role_name')
    .populate('approved_by', 'fullName email role_name');

  // Add like status for current user
  const videosWithLikeStatus = await Promise.all(
    videos.map(async (video) => {
      const isLiked = await video.isLikedBy(req.user._id);
      return {
        ...video.toObject(),
        is_liked: isLiked
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, videosWithLikeStatus, 'Popular videos fetched successfully')
  );
});

export {
  likeVideo,
  unlikeVideo,
  getMyLikedVideos,
  getVideoLikes,
  checkLikeStatus,
  getPopularVideos
};
