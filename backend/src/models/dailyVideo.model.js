import mongoose, { Schema } from 'mongoose';

const dailyVideoSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  video_id: { type: Schema.Types.ObjectId, ref: 'SafetyVideo', required: true },
  assigned_date: { type: Date, required: true },
  watched: { type: Boolean, default: false },
  watched_date: { type: Date }
}, { timestamps: true });

export const DailyVideo = mongoose.model('DailyVideo', dailyVideoSchema);
