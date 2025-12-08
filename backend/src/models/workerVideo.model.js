import mongoose, { Schema } from 'mongoose';

const workerVideoSchema = new Schema({
  uploaded_by: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  video_url: { 
    type: String, 
    required: true 
  },
  thumbnail_url: { 
    type: String 
  },
  approval_status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'auto_rejected'], 
    default: 'pending' 
  },
  approved_by: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approved_at: { 
    type: Date 
  },
  rejection_reason: { 
    type: String 
  },
  moderation_status: {
    type: String,
    enum: ['passed', 'flagged', 'auto_rejected'],
    default: 'passed'
  },
  moderation_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  },
  moderation_flags: [{
    type: String
  }],
  requires_manual_review: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['safety', 'training', 'incident', 'tutorial', 'other'],
    default: 'other'
  },
  duration: {
    type: Number // in seconds
  },
  views: {
    type: Number,
    default: 0
  },
  like_count: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for faster queries
workerVideoSchema.index({ approval_status: 1, createdAt: -1 });
workerVideoSchema.index({ uploaded_by: 1 });
workerVideoSchema.index({ like_count: -1 }); // For sorting by popularity

// Virtual field for engagement score (for recommendations)
workerVideoSchema.virtual('engagement_score').get(function() {
  const ageInDays = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(1, 30 - ageInDays) / 30; // Newer content gets boost
  return (this.like_count * 2 + this.views * 0.5) * recencyFactor;
});

// Helper method to check if a user has liked this video
workerVideoSchema.methods.isLikedBy = async function(userId) {
  const Like = mongoose.model('Like');
  const like = await Like.findOne({ user_id: userId, video_id: this._id });
  return !!like;
};

export const WorkerVideo = mongoose.model('WorkerVideo', workerVideoSchema);
