import mongoose, { Schema } from 'mongoose';

const hazardAssignmentSchema = new Schema({
  report_id: { type: Schema.Types.ObjectId, ref: 'HazardReport', required: true },
  assigned_to_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_at: { type: Date, required: true },
  due_date: { type: Date, required: true },
  status: { type: String, enum: ['assigned', 'in-progress', 'completed'], default: 'assigned' }
}, { timestamps: true });

export const HazardAssignment = mongoose.model('HazardAssignment', hazardAssignmentSchema);
