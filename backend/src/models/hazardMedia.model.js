import mongoose, { Schema } from 'mongoose';

const hazardMediaSchema = new Schema({
  report_id: { type: Schema.Types.ObjectId, ref: 'HazardReport', required: true },
  media_type: { type: String, required: true },  // e.g., photo, video, audio
  language_code: { type: String },
  url: { type: String, required: true },
  duration: { type: Number }, // Duration in seconds (for audio/video)
  file_size: { type: Number }, // File size in bytes
  mime_type: { type: String } // Original MIME type
}, { timestamps: true });

export const HazardMedia = mongoose.model('HazardMedia', hazardMediaSchema);
