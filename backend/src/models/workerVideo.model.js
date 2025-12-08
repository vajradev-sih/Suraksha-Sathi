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
    enum: ['pending', 'approved', 'rejected'], 
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
  }
}, { timestamps: true });

// Index for faster queries
workerVideoSchema.index({ approval_status: 1, createdAt: -1 });
workerVideoSchema.index({ uploaded_by: 1 });

export const WorkerVideo = mongoose.model('WorkerVideo', workerVideoSchema);
