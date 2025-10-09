import mongoose, { Schema } from 'mongoose';

const hazardReportSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reported_at: { type: Date, required: true },
  location: { type: String, required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'HazardCategory', required: true },
  severity_id: { type: Schema.Types.ObjectId, ref: 'SeverityTag', required: true },
  description: { type: String },
  status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' }
}, { timestamps: true });

export const HazardReport = mongoose.model('HazardReport', hazardReportSchema);
