import mongoose, { Schema } from 'mongoose';

const likeSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video_id: {
    type: Schema.Types.ObjectId,
    ref: 'WorkerVideo',
    required: true
  }
}, { timestamps: true });

// Compound index to ensure a user can only like a video once
likeSchema.index({ user_id: 1, video_id: 1 }, { unique: true });

// Index for faster queries
likeSchema.index({ video_id: 1, createdAt: -1 });
likeSchema.index({ user_id: 1, createdAt: -1 });

export const Like = mongoose.model('Like', likeSchema);
