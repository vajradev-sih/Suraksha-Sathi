import mongoose, { Schema } from 'mongoose';

const followUpActionSchema = new Schema({
  report_id: { type: Schema.Types.ObjectId, ref: 'HazardReport', required: true },
  action_by_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action_date: { type: Date, required: true },
  comments: { type: String },
  before_media_url: { type: String },
  after_media_url: { type: String },
  closed_at: { type: Date }
}, { timestamps: true });

export const FollowUpAction = mongoose.model('FollowUpAction', followUpActionSchema);
