import { Follow } from '../models/follow.model.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Follow a user
const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Cannot follow yourself
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  // Check if user to follow exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    throw new ApiError(404, 'User not found');
  }

  // Check if already following
  const existingFollow = await Follow.findOne({
    follower_id: req.user._id,
    following_id: userId
  });

  if (existingFollow) {
    throw new ApiError(400, 'You are already following this user');
  }

  // Create follow relationship
  const follow = await Follow.create({
    follower_id: req.user._id,
    following_id: userId
  });

  const populatedFollow = await Follow.findById(follow._id)
    .populate('following_id', 'fullName email role_name');

  res.status(201).json(
    new ApiResponse(201, populatedFollow, 'User followed successfully')
  );
});

// Unfollow a user
const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Find and delete the follow relationship
  const follow = await Follow.findOneAndDelete({
    follower_id: req.user._id,
    following_id: userId
  });

  if (!follow) {
    throw new ApiError(404, 'You are not following this user');
  }

  res.status(200).json(
    new ApiResponse(200, {}, 'User unfollowed successfully')
  );
});

// Get followers of a user
const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50, page = 1 } = req.query;

  const targetUserId = userId || req.user._id;

  // Check if user exists
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const followers = await Follow.find({ following_id: targetUserId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('follower_id', 'fullName email role_name');

  const totalFollowers = await Follow.countDocuments({ following_id: targetUserId });

  // Check if current user follows each follower
  const followersWithStatus = await Promise.all(
    followers.map(async (follow) => {
      const isFollowing = await req.user.isFollowing(follow.follower_id._id);
      return {
        user: follow.follower_id,
        followed_at: follow.createdAt,
        is_following: isFollowing
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, {
      followers: followersWithStatus,
      total: totalFollowers,
      page: parseInt(page),
      total_pages: Math.ceil(totalFollowers / parseInt(limit))
    }, 'Followers fetched successfully')
  );
});

// Get users that a user is following
const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50, page = 1 } = req.query;

  const targetUserId = userId || req.user._id;

  // Check if user exists
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const following = await Follow.find({ follower_id: targetUserId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('following_id', 'fullName email role_name');

  const totalFollowing = await Follow.countDocuments({ follower_id: targetUserId });

  // Check if current user follows each user in the list
  const followingWithStatus = await Promise.all(
    following.map(async (follow) => {
      const isFollowing = await req.user.isFollowing(follow.following_id._id);
      return {
        user: follow.following_id,
        followed_at: follow.createdAt,
        is_following: isFollowing
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, {
      following: followingWithStatus,
      total: totalFollowing,
      page: parseInt(page),
      total_pages: Math.ceil(totalFollowing / parseInt(limit))
    }, 'Following list fetched successfully')
  );
});

// Check if current user is following another user
const checkFollowStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const follow = await Follow.findOne({
    follower_id: req.user._id,
    following_id: userId
  });

  res.status(200).json(
    new ApiResponse(200, { is_following: !!follow }, 'Follow status checked')
  );
});

// Get user profile with follower/following counts
const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const followerCount = await user.getFollowerCount();
  const followingCount = await user.getFollowingCount();
  const isFollowing = await req.user.isFollowing(userId);

  const profile = {
    ...user.toObject(),
    follower_count: followerCount,
    following_count: followingCount,
    is_following: isFollowing
  };

  res.status(200).json(
    new ApiResponse(200, profile, 'User profile fetched successfully')
  );
});

// Get suggested users to follow (users with most followers)
const getSuggestedUsers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Get users current user is already following
  const currentFollowing = await Follow.find({ follower_id: req.user._id })
    .select('following_id');
  const followingIds = currentFollowing.map(f => f.following_id.toString());

  // Aggregate to find users with most followers (excluding current user and already following)
  const suggestedUsers = await Follow.aggregate([
    {
      $match: {
        following_id: { 
          $ne: req.user._id,
          $nin: followingIds.map(id => id) 
        }
      }
    },
    {
      $group: {
        _id: '$following_id',
        follower_count: { $sum: 1 }
      }
    },
    { $sort: { follower_count: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: '$user._id',
        fullName: '$user.fullName',
        email: '$user.email',
        role_name: '$user.role_name',
        follower_count: 1
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, suggestedUsers, 'Suggested users fetched successfully')
  );
});

export {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getUserProfile,
  getSuggestedUsers
};
