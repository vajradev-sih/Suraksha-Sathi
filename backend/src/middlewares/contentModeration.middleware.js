import { moderateContent, shouldAutoReject, getModerationSummary } from '../utils/contentModeration.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import fs from 'fs/promises';

/**
 * Middleware to moderate uploaded content before processing
 * This should be used after file upload but before saving to database
 */
export const moderateUploadedContent = asyncHandler(async (req, res, next) => {
  console.log('[MODERATION MIDDLEWARE] Started');
  console.log('[MODERATION MIDDLEWARE] Has file:', !!req.file);
  console.log('[MODERATION MIDDLEWARE] Has title:', !!req.body.title);
  
  // Only moderate if there's a file and video upload context
  if (!req.file || !req.body.title) {
    console.log('[MODERATION MIDDLEWARE] Skipping - no file or title');
    return next();
  }

  const { title, description } = req.body;
  const fileInfo = {
    size: req.file.size,
    mimetype: req.file.mimetype,
    filename: req.file.filename
  };

  console.log('[MODERATION MIDDLEWARE] Checking content...');
  // Perform text-based moderation first (fast check)
  const preliminaryModeration = await moderateContent({
    title,
    description,
    fileInfo
  });
  console.log('[MODERATION MIDDLEWARE] Moderation result:', preliminaryModeration);

  // If content is auto-rejected based on text, reject immediately
  if (shouldAutoReject(preliminaryModeration)) {
    console.log('[MODERATION MIDDLEWARE] Content auto-rejected!');
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
  console.log('[MODERATION MIDDLEWARE] Passed - calling next()');
  next();
});

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
