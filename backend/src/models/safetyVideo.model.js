import mongoose, { Schema } from 'mongoose';

const safetyVideoSchema = new Schema({
  external_integration_id: { type: Schema.Types.ObjectId, ref: 'ExternalIntegration', required: false },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true },
  thumbnail_url: { type: String }
}, { timestamps: true });

export const SafetyVideo = mongoose.model('SafetyVideo', safetyVideoSchema);
