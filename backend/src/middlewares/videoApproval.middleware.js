import { WorkerVideo } from '../models/workerVideo.model.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to check if a video is approved before allowing access
 * Used on routes that should only show approved content to regular users
 */
export const requireApprovedVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new ApiError(400, 'Video ID is required'));
    }

    const video = await WorkerVideo.findById(id);

    if (!video) {
      return next(new ApiError(404, 'Video not found'));
    }

    // Admins and TrainingOfficers can view any video
    const isAdmin = req.user && (
      req.user.role_name === 'Admin' || 
      req.user.role_name === 'TrainingOfficer'
    );

    // Uploader can view their own video regardless of status
    const isUploader = req.user && 
      video.uploaded_by.toString() === req.user._id.toString();

    // Regular users can only view approved videos
    if (!isAdmin && !isUploader && video.approval_status !== 'approved') {
      return next(new ApiError(403, 'This video is not yet approved'));
    }

    // Attach video to request for use in controller
    req.video = video;
    next();
  } catch (error) {
    return next(new ApiError(500, `Error checking video approval: ${error.message}`));
  }
};

/**
 * Middleware to ensure only admins can perform approval actions
 */
export const requireApprovalPermission = (req, res, next) => {
  const isAdmin = req.user && (
    req.user.role_name === 'Admin' || 
    req.user.role_name === 'TrainingOfficer'
  );

  if (!isAdmin) {
    return next(new ApiError(403, 'Only admins can approve or reject videos'));
  }

  next();
};
