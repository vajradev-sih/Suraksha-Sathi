/**
 * Content Moderation Utility
 * 
 * Uses multiple strategies to detect inappropriate content:
 * 1. Cloudinary AI moderation (if available)
 * 2. Text-based filtering for titles/descriptions
 * 3. External AI moderation APIs (optional)
 */

// List of inappropriate keywords/phrases
const INAPPROPRIATE_KEYWORDS = [
  'violence', 'weapon', 'abuse', 'harassment', 'hate',
  'explicit', 'nsfw', 'gore', 'blood', 'death',
  'drug', 'alcohol', 'smoking', 'gambling',
  // Add more based on your safety requirements
];

/**
 * Check text content for inappropriate keywords
 */
const moderateText = (text) => {
  if (!text) return { isAppropriate: true };

  const lowerText = text.toLowerCase();
  const foundKeywords = INAPPROPRIATE_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword)
  );

  if (foundKeywords.length > 0) {
    return {
      isAppropriate: false,
      reason: `Inappropriate content detected: ${foundKeywords.join(', ')}`,
      confidence: 0.8
    };
  }

  return { isAppropriate: true };
};

/**
 * Moderate uploaded video using Cloudinary's moderation features
 */
const moderateVideoWithCloudinary = async (cloudinaryResult) => {
  try {
    // Check if Cloudinary returned moderation info
    if (cloudinaryResult.moderation && cloudinaryResult.moderation.length > 0) {
      const moderation = cloudinaryResult.moderation[0];
      
      if (moderation.status === 'rejected') {
        return {
          isAppropriate: false,
          reason: 'Content flagged by AI moderation',
          details: moderation.kind || 'inappropriate content',
          confidence: 0.9
        };
      }
      
      if (moderation.status === 'pending') {
        // For pending moderation, we can choose to approve or hold
        // Here we'll allow it to go through but mark it
        return {
          isAppropriate: true,
          requiresReview: true,
          reason: 'Pending manual moderation review'
        };
      }
    }

    return { isAppropriate: true };
  } catch (error) {
    console.error('Cloudinary moderation error:', error);
    // On error, allow through but flag for manual review
    return { 
      isAppropriate: true, 
      requiresReview: true,
      reason: 'Moderation check failed, requires manual review'
    };
  }
};

/**
 * Moderate video using external AI service (Google Cloud Video Intelligence API)
 * This is optional and requires API key configuration
 */
const moderateWithExternalAI = async (videoUrl) => {
  try {
    // Check if external moderation is configured
    if (!process.env.ENABLE_EXTERNAL_MODERATION) {
      return { isAppropriate: true };
    }

    // Example integration with content moderation API
    // You would need to configure the appropriate API
    
    // Placeholder for external API call
    // const response = await axios.post('MODERATION_API_URL', {
    //   video_url: videoUrl,
    //   features: ['violence', 'adult', 'offensive']
    // });

    return { isAppropriate: true };
  } catch (error) {
    console.error('External moderation error:', error);
    return { 
      isAppropriate: true,
      requiresReview: true,
      reason: 'External moderation unavailable'
    };
  }
};

/**
 * Analyze video metadata for suspicious patterns
 */
const analyzeMetadata = (fileInfo) => {
  const suspiciousPatterns = {
    isAppropriate: true,
    warnings: []
  };

  // Check file size (extremely large files might be suspicious)
  if (fileInfo.size > 500 * 1024 * 1024) { // 500MB
    suspiciousPatterns.warnings.push('Unusually large file size');
  }

  // Check duration (extremely long videos might need review)
  if (fileInfo.duration && fileInfo.duration > 3600) { // 1 hour
    suspiciousPatterns.warnings.push('Very long video duration');
  }

  return suspiciousPatterns;
};

/**
 * Comprehensive content moderation function
 * Returns moderation result with decision and reason
 */
export const moderateContent = async ({
  title,
  description,
  cloudinaryResult,
  fileInfo
}) => {
  const moderationResults = {
    isAppropriate: true,
    autoRejected: false,
    requiresReview: false,
    reasons: [],
    confidence: 1.0
  };

  // 1. Moderate title
  const titleModeration = moderateText(title);
  if (!titleModeration.isAppropriate) {
    moderationResults.isAppropriate = false;
    moderationResults.autoRejected = true;
    moderationResults.reasons.push(titleModeration.reason);
    moderationResults.confidence = Math.min(moderationResults.confidence, titleModeration.confidence);
  }

  // 2. Moderate description
  if (description) {
    const descModeration = moderateText(description);
    if (!descModeration.isAppropriate) {
      moderationResults.isAppropriate = false;
      moderationResults.autoRejected = true;
      moderationResults.reasons.push(descModeration.reason);
      moderationResults.confidence = Math.min(moderationResults.confidence, descModeration.confidence);
    }
  }

  // 3. Check Cloudinary moderation (if available)
  if (cloudinaryResult) {
    const cloudinaryMod = await moderateVideoWithCloudinary(cloudinaryResult);
    if (!cloudinaryMod.isAppropriate) {
      moderationResults.isAppropriate = false;
      moderationResults.autoRejected = true;
      moderationResults.reasons.push(cloudinaryMod.reason);
      if (cloudinaryMod.details) {
        moderationResults.reasons.push(`Details: ${cloudinaryMod.details}`);
      }
      moderationResults.confidence = Math.min(moderationResults.confidence, cloudinaryMod.confidence);
    } else if (cloudinaryMod.requiresReview) {
      moderationResults.requiresReview = true;
      moderationResults.reasons.push(cloudinaryMod.reason);
    }
  }

  // 4. Analyze metadata
  if (fileInfo) {
    const metadataAnalysis = analyzeMetadata(fileInfo);
    if (metadataAnalysis.warnings.length > 0) {
      moderationResults.requiresReview = true;
      moderationResults.reasons.push(...metadataAnalysis.warnings);
    }
  }

  // 5. Optional: External AI moderation
  if (cloudinaryResult && process.env.ENABLE_EXTERNAL_MODERATION === 'true') {
    const externalMod = await moderateWithExternalAI(cloudinaryResult.secure_url);
    if (!externalMod.isAppropriate) {
      moderationResults.isAppropriate = false;
      moderationResults.autoRejected = true;
      moderationResults.reasons.push(externalMod.reason);
    } else if (externalMod.requiresReview) {
      moderationResults.requiresReview = true;
      moderationResults.reasons.push(externalMod.reason);
    }
  }

  return moderationResults;
};

/**
 * Simple function to check if content should be auto-rejected
 */
export const shouldAutoReject = (moderationResult) => {
  return moderationResult.autoRejected && !moderationResult.isAppropriate;
};

/**
 * Get human-readable moderation summary
 */
export const getModerationSummary = (moderationResult) => {
  if (moderationResult.autoRejected) {
    return `Auto-rejected: ${moderationResult.reasons.join('; ')}`;
  }
  
  if (moderationResult.requiresReview) {
    return `Flagged for review: ${moderationResult.reasons.join('; ')}`;
  }
  
  return 'Content passed automated moderation';
};
