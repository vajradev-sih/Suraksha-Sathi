import mongoose, { Schema } from 'mongoose';

const severityTagSchema = new Schema({
  level: { type: String, required: true, unique: true },
  description: { type: String }
}, { timestamps: true });

export const SeverityTag = mongoose.model('SeverityTag', severityTagSchema);
