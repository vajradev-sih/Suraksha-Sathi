import { WorkerVideo } from '../models/workerVideo.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

// Worker uploads video (pending approval)
const uploadWorkerVideo = asyncHandler(async (req, res) => {
  const { title, description, category, duration } = req.body;

  // Validate file
  if (!req.file) {
    throw new ApiError(400, 'Video file is required');
  }

  // Validate title
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  // Check if content was flagged by moderation middleware
  // If moderationResult exists and was rejected, this code won't run
  // because middleware throws error before reaching here
  
  // Get moderation result from middleware (if it passed preliminary checks)
  const moderationResult = req.moderationResult || {
    isAppropriate: true,
    requiresReview: false,
    reasons: []
  };

  // Upload video to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, { 
    folder: 'worker_videos',
    resource_type: 'video',
    moderation: 'aws_rek' // Enable Cloudinary's AI moderation
  });

  // Delete local file after upload
  await fs.unlink(req.file.path).catch(() => {});

  // Determine moderation status and approval status
  let moderationStatus = 'passed';
  let approvalStatus = 'pending';
  let requiresManualReview = moderationResult.requiresReview || false;
  
  // If moderation flagged for review, mark accordingly
  if (moderationResult.requiresReview) {
    moderationStatus = 'flagged';
    requiresManualReview = true;
  }

  // Create video record with appropriate status
  const video = await WorkerVideo.create({
    uploaded_by: req.user._id,
    title,
    description: description || '',
    video_url: result.secure_url,
    thumbnail_url: result.secure_url.replace(/\.[^.]+$/, '.jpg'),
    category: category || 'other',
    duration: duration || result.duration || 0,
    approval_status: approvalStatus,
    moderation_status: moderationStatus,
    moderation_score: moderationResult.confidence || 1,
    moderation_flags: moderationResult.reasons || [],
    requires_manual_review: requiresManualReview
  });

  const populatedVideo = await WorkerVideo.findById(video._id)
    .populate('uploaded_by', 'fullName email role_name');

  res.status(201).json(
    new ApiResponse(201, populatedVideo, 'Video uploaded successfully and pending approval')
  );
});

// Admin approves video
const approveVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await WorkerVideo.findById(id);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (video.approval_status === 'approved') {
    throw new ApiError(400, 'Video is already approved');
  }

  video.approval_status = 'approved';
  video.approved_by = req.user._id;
  video.approved_at = new Date();
  video.rejection_reason = undefined; // Clear any previous rejection reason

  await video.save();

  const populatedVideo = await WorkerVideo.findById(video._id)
    .populate('uploaded_by', 'fullName email role_name')
    .populate('approved_by', 'fullName email role_name');

  res.status(200).json(
    new ApiResponse(200, populatedVideo, 'Video approved successfully')
  );
});

// Admin rejects video
const rejectVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  const video = await WorkerVideo.findById(id);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (video.approval_status === 'rejected') {
    throw new ApiError(400, 'Video is already rejected');
  }

  video.approval_status = 'rejected';
  video.approved_by = req.user._id;
  video.approved_at = new Date();
  video.rejection_reason = rejection_reason || 'No reason provided';

  await video.save();

  const populatedVideo = await WorkerVideo.findById(video._id)
    .populate('uploaded_by', 'fullName email role_name')
    .populate('approved_by', 'fullName email role_name');

  res.status(200).json(
    new ApiResponse(200, populatedVideo, 'Video rejected')
  );
});

// Get all videos (with optional status filter)
const getAllWorkerVideos = asyncHandler(async (req, res) => {
  const { status, category, uploaded_by } = req.query;
  const filter = {};

  if (status) {
    filter.approval_status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (uploaded_by) {
    filter.uploaded_by = uploaded_by;
  }

  const videos = await WorkerVideo.find(filter)
    .populate('uploaded_by', 'fullName email role_name')
    .populate('approved_by', 'fullName email role_name')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, videos, 'Worker videos fetched successfully')
  );
});

// Get pending videos (admin only)
const getPendingVideos = asyncHandler(async (req, res) => {
  const videos = await WorkerVideo.find({ approval_status: 'pending' })
    .populate('uploaded_by', 'fullName email role_name')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, videos, 'Pending videos fetched successfully')
  );
});

// Get approved videos (public access)
const getApprovedVideos = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { approval_status: 'approved' };

  if (category) {
    filter.category = category;
  }

  const videos = await WorkerVideo.find(filter)
    .populate('uploaded_by', 'fullName email role_name')
    .populate('approved_by', 'fullName email role_name')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, videos, 'Approved videos fetched successfully')
  );
});

// Get video by ID
const getWorkerVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await WorkerVideo.findById(id)
    .populate('uploaded_by', 'fullName email role_name')
    .populate('approved_by', 'fullName email role_name');

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Increment view count
  video.views += 1;
  await video.save();

  res.status(200).json(
    new ApiResponse(200, video, 'Video fetched successfully')
  );
});

// Get my uploaded videos
const getMyVideos = asyncHandler(async (req, res) => {
  const videos = await WorkerVideo.find({ uploaded_by: req.user._id })
    .populate('approved_by', 'fullName email role_name')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, videos, 'Your videos fetched successfully')
  );
});

// Update video (only if pending or by uploader)
const updateWorkerVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;

  const video = await WorkerVideo.findById(id);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Only the uploader can edit, and only if pending
  if (video.uploaded_by.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own videos');
  }

  if (video.approval_status !== 'pending') {
    throw new ApiError(400, 'Cannot edit video after it has been reviewed');
  }

  if (title) video.title = title;
  if (description) video.description = description;
  if (category) video.category = category;

  await video.save();

  const updatedVideo = await WorkerVideo.findById(video._id)
    .populate('uploaded_by', 'fullName email role_name');

  res.status(200).json(
    new ApiResponse(200, updatedVideo, 'Video updated successfully')
  );
});

// Delete video
const deleteWorkerVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await WorkerVideo.findById(id);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Only uploader or admin can delete
  const isUploader = video.uploaded_by.toString() === req.user._id.toString();
  const isAdmin = req.user.role_name === 'Admin' || 
                  req.user.role_name === 'TrainingOfficer' || 
                  req.user.role_name === 'SafetyOfficer'; // Backward compatibility

  if (!isUploader && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to delete this video');
  }

  await WorkerVideo.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, {}, 'Video deleted successfully')
  );
});

// Get auto-rejected videos (admin only - for audit)
const getAutoRejectedVideos = asyncHandler(async (req, res) => {
  const { limit = 50, page = 1 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const videos = await WorkerVideo.find({ 
    approval_status: 'auto_rejected',
    moderation_status: 'auto_rejected'
  })
    .populate('uploaded_by', 'fullName email role_name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await WorkerVideo.countDocuments({ 
    approval_status: 'auto_rejected',
    moderation_status: 'auto_rejected'
  });

  res.status(200).json(
    new ApiResponse(200, {
      videos,
      total,
      page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit))
    }, 'Auto-rejected videos fetched successfully')
  );
});

// Get flagged videos requiring manual review (admin only)
const getFlaggedVideos = asyncHandler(async (req, res) => {
  const videos = await WorkerVideo.find({ 
    requires_manual_review: true,
    approval_status: 'pending'
  })
    .populate('uploaded_by', 'fullName email role_name')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, videos, 'Flagged videos requiring review fetched successfully')
  );
});

// Get moderation statistics (admin only)
const getModerationStats = asyncHandler(async (req, res) => {
  const stats = await WorkerVideo.aggregate([
    {
      $group: {
        _id: '$moderation_status',
        count: { $sum: 1 },
        avg_score: { $avg: '$moderation_score' }
      }
    }
  ]);

  const approvalStats = await WorkerVideo.aggregate([
    {
      $group: {
        _id: '$approval_status',
        count: { $sum: 1 }
      }
    }
  ]);

  const flaggedCount = await WorkerVideo.countDocuments({ requires_manual_review: true });

  res.status(200).json(
    new ApiResponse(200, {
      moderation_stats: stats,
      approval_stats: approvalStats,
      flagged_for_review: flaggedCount
    }, 'Moderation statistics fetched successfully')
  );
});

export {
  uploadWorkerVideo,
  approveVideo,
  rejectVideo,
  getAllWorkerVideos,
  getPendingVideos,
  getApprovedVideos,
  getWorkerVideoById,
  getMyVideos,
  updateWorkerVideo,
  deleteWorkerVideo,
  getAutoRejectedVideos,
  getFlaggedVideos,
  getModerationStats
};