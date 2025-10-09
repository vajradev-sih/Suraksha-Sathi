import mongoose, { Schema } from 'mongoose';

const hazardAuditSchema = new Schema({
  report_id: { type: Schema.Types.ObjectId, ref: 'HazardReport', required: true },
  event_type: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event_timestamp: { type: Date, required: true },
  notes: { type: String }
}, { timestamps: true });

export const HazardAudit = mongoose.model('HazardAudit', hazardAuditSchema);
