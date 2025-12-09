/**
 * Content Moderation Utility
 * 
 * Uses multiple strategies to detect inappropriate content:
 * 1. Cloudinary AI moderation (if available)
 * 2. Text-based filtering for titles/descriptions
 * 3. External AI moderation APIs (optional)
 */

// List of inappropriate keywords/phrases - VIOLENCE & SAFETY
const VIOLENCE_KEYWORDS = [
  'violence', 'violent', 'weapon', 'gun', 'knife', 'assault', 
  'attack', 'kill', 'murder', 'death', 'suicide', 'bomb', 
  'terrorism', 'torture', 'gore', 'blood', 'bleeding'
];

// HARASSMENT & ABUSE
const HARASSMENT_KEYWORDS = [
  'abuse', 'harassment', 'harass', 'bully', 'bullying', 
  'threaten', 'threat', 'intimidate', 'stalk', 'stalking'
];

// HATE SPEECH & DISCRIMINATION
const HATE_SPEECH_KEYWORDS = [
  'hate', 'racist', 'racism', 'sexist', 'sexism', 
  'discrimination', 'discriminate', 'slur', 'bigot', 'bigotry'
];

// EXPLICIT & ADULT CONTENT
const EXPLICIT_KEYWORDS = [
  'explicit', 'nsfw', 'nude', 'naked', 'pornography', 'porn',
  'sexual', 'sex', 'xxx', 'adult content', 'lewd', 'obscene'
];

// SUBSTANCE ABUSE
const SUBSTANCE_KEYWORDS = [
  'drug', 'drugs', 'cocaine', 'heroin', 'meth', 'marijuana',
  'alcohol', 'drunk', 'intoxicated', 'smoking', 'cigarette',
  'gambling', 'gamble', 'bet', 'betting'
];

// PROFANITY & CUSS WORDS (Common English profanity)
const PROFANITY_KEYWORDS = [
  // Tier 1 - Strong profanity
  'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker', 'motherfucking',
  'fucks', 'fuckin', 'fck', 'fuk', 'fk',
  'shit', 'shitting', 'shitty', 'shits', 'bullshit',
  'bitch', 'bitches', 'bitching', 'son of a bitch',
  'bastard', 'asshole', 'assholes', 
  'damn', 'damned', 'dammit', 'goddamn',
  'hell', 'crap', 'piss', 'pissed', 'pissing',
  'dick', 'dicks', 'dickhead', 
  'cock', 'cocks', 'cocksucker',
  'pussy', 'pussies', 'cunt', 'cunts',
  
  // Tier 2 - Moderate profanity
  'ass', 'arse', 'bloody', 'bugger', 'bollocks', 'wanker',
  'whore', 'slut', 'fag', 'faggot', 'retard', 'retarded',
  
  // Tier 3 - Mild profanity & insults
  'idiot', 'stupid', 'moron', 'dumb', 'dumbass', 'jerk',
  'loser', 'sucker', 'fool', 'freak'
];

// SPAM & SCAM INDICATORS
const SPAM_KEYWORDS = [
  'click here', 'buy now', 'limited offer', 'act now',
  'free money', 'get rich', 'make money fast', 'viagra',
  'casino', 'lottery', 'prize', 'winner', 'congratulations'
];

// Combine all keyword lists
const INAPPROPRIATE_KEYWORDS = [
  ...VIOLENCE_KEYWORDS,
  ...HARASSMENT_KEYWORDS,
  ...HATE_SPEECH_KEYWORDS,
  ...EXPLICIT_KEYWORDS,
  ...SUBSTANCE_KEYWORDS,
  ...PROFANITY_KEYWORDS,
  ...SPAM_KEYWORDS
];

/**
 * Check text content for inappropriate keywords with enhanced detection
 */
const moderateText = (text) => {
  if (!text) return { isAppropriate: true };

  const lowerText = text.toLowerCase();
  
  // Check for profanity and inappropriate content
  const foundKeywords = INAPPROPRIATE_KEYWORDS.filter(keyword => {
    // Use word boundary matching to avoid false positives
    // e.g., "assessment" won't match "ass"
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerText);
  });

  if (foundKeywords.length > 0) {
    // Categorize the violations
    const categories = [];
    if (foundKeywords.some(k => PROFANITY_KEYWORDS.includes(k))) categories.push('profanity');
    if (foundKeywords.some(k => VIOLENCE_KEYWORDS.includes(k))) categories.push('violence');
    if (foundKeywords.some(k => EXPLICIT_KEYWORDS.includes(k))) categories.push('explicit content');
    if (foundKeywords.some(k => HATE_SPEECH_KEYWORDS.includes(k))) categories.push('hate speech');
    if (foundKeywords.some(k => HARASSMENT_KEYWORDS.includes(k))) categories.push('harassment');
    if (foundKeywords.some(k => SUBSTANCE_KEYWORDS.includes(k))) categories.push('substance abuse');
    
    return {
      isAppropriate: false,
      reason: `Inappropriate content detected (${categories.join(', ')}): ${foundKeywords.slice(0, 3).join(', ')}${foundKeywords.length > 3 ? '...' : ''}`,
      foundKeywords: foundKeywords,
      categories: categories,
      confidence: 0.9 // High confidence for keyword matches
    };
  }

  // Additional check for leetspeak/obfuscated profanity
  const obfuscatedText = lowerText
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\*/g, '')      // Remove asterisks (f*ck → fuck)
    .replace(/@/g, 'a')      // Replace @ with a
    .replace(/\$/g, 's')     // Replace $ with s
    .replace(/#/g, '')       // Remove hashes
    .replace(/\+/g, 't')     // Replace + with t
    .replace(/!/g, 'i')      // Replace ! with i
    .replace(/\./g, '');     // Remove dots (f.u.c.k → fuck)
  
  const obfuscatedKeywords = PROFANITY_KEYWORDS.filter(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(obfuscatedText) && !regex.test(lowerText);
  });

  if (obfuscatedKeywords.length > 0) {
    return {
      isAppropriate: false,
      reason: `Obfuscated profanity detected: ${obfuscatedKeywords.join(', ')}`,
      foundKeywords: obfuscatedKeywords,
      categories: ['profanity'],
      confidence: 0.7 // Lower confidence for obfuscated matches
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
