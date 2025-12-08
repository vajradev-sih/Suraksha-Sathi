import { moderateContent, shouldAutoReject, getModerationSummary } from '../utils/contentModeration.js';
import { ApiError } from '../utils/ApiError.js';
import fs from 'fs/promises';

/**
 * Middleware to moderate uploaded content before processing
 * This should be used after file upload but before saving to database
 */
export const moderateUploadedContent = async (req, res, next) => {
  try {
    // Only moderate if there's a file and video upload context
    if (!req.file || !req.body.title) {
      return next();
    }

    const { title, description } = req.body;
    const fileInfo = {
      size: req.file.size,
      mimetype: req.file.mimetype,
      filename: req.file.filename
    };

    // Perform text-based moderation first (fast check)
    const preliminaryModeration = await moderateContent({
      title,
      description,
      fileInfo
    });

    // If content is auto-rejected based on text, reject immediately
    if (shouldAutoReject(preliminaryModeration)) {
      // Clean up uploaded file
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      throw new ApiError(
        400,
        `Upload rejected: ${getModerationSummary(preliminaryModeration)}. Please review our content guidelines.`
      );
    }

    // Store preliminary moderation result for later use
    req.moderationResult = preliminaryModeration;
    
    next();
  } catch (error) {
    // Clean up file on error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(500, `Content moderation failed: ${error.message}`));
    }
  }
};

/**
 * Middleware to moderate after Cloudinary upload
 * Use this if you want to check the video content itself (not just metadata)
 */
export const moderateCloudinaryContent = async (cloudinaryResult, title, description) => {
  try {
    const fullModeration = await moderateContent({
      title,
      description,
      cloudinaryResult,
      fileInfo: {
        size: cloudinaryResult.bytes,
        duration: cloudinaryResult.duration
      }
    });

    return fullModeration;
  } catch (error) {
    console.error('Cloudinary content moderation error:', error);
    return {
      isAppropriate: true,
      requiresReview: true,
      reasons: ['Moderation check encountered an error'],
      confidence: 0.5
    };
  }
};
