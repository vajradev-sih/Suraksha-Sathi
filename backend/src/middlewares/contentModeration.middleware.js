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
    console.log('[MODERATION MIDDLEWARE] Reason:', preliminaryModeration.reasons);
    
    // Clean up uploaded file
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    // Build detailed, user-friendly error message
    const rejectionReasons = preliminaryModeration.reasons.join('. ');
    const foundKeywords = preliminaryModeration.foundKeywords || [];
    const categories = preliminaryModeration.categories || [];
    
    let errorMessage = '❌ Content Rejected - Upload Not Allowed\n\n';
    errorMessage += `REASON: Your submission contains inappropriate content that violates our community guidelines.\n\n`;
    
    if (categories.length > 0) {
      errorMessage += `VIOLATIONS DETECTED:\n`;
      categories.forEach(cat => {
        errorMessage += `  • ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`;
      });
      errorMessage += '\n';
    }
    
    if (foundKeywords.length > 0 && foundKeywords.length <= 5) {
      errorMessage += `FLAGGED CONTENT: "${foundKeywords.join('", "')}"\n\n`;
    }
    
    errorMessage += `WHY NOT ALLOWED:\n`;
    errorMessage += `  • This content could be offensive or harmful to others\n`;
    errorMessage += `  • It violates workplace safety and respect standards\n`;
    errorMessage += `  • Our platform maintains a professional environment\n\n`;
    
    errorMessage += `WHAT YOU CAN DO:\n`;
    errorMessage += `  • Remove any profanity, cuss words, or offensive language\n`;
    errorMessage += `  • Ensure your title and description are professional\n`;
    errorMessage += `  • Focus on safety-related content only\n`;
    errorMessage += `  • Contact support if you believe this is an error\n\n`;
    
    errorMessage += `COMMUNITY GUIDELINES:\n`;
    errorMessage += `  ✓ Use respectful, professional language\n`;
    errorMessage += `  ✓ Focus on workplace safety and best practices\n`;
    errorMessage += `  ✗ No profanity, hate speech, or harassment\n`;
    errorMessage += `  ✗ No explicit, violent, or offensive content\n`;
    errorMessage += `  ✗ No substance abuse or dangerous behaviors`;

    throw new ApiError(400, errorMessage);
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
