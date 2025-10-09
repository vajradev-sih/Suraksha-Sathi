import mongoose, { Schema } from 'mongoose';

const escalationSchema = new Schema({
  report_id: { type: Schema.Types.ObjectId, ref: 'HazardReport', required: true },
  escalation_stage: { type: Number, required: true },
  escalated_at: { type: Date, required: true }
}, { timestamps: true });

export const Escalation = mongoose.model('Escalation', escalationSchema);
