import mongoose, { Schema } from 'mongoose';

const hazardMediaSchema = new Schema({
  report_id: { type: Schema.Types.ObjectId, ref: 'HazardReport', required: true },
  media_type: { type: String, required: true },  // e.g., photo, video
  language_code: { type: String },
  url: { type: String, required: true }
}, { timestamps: true });

export const HazardMedia = mongoose.model('HazardMedia', hazardMediaSchema);
