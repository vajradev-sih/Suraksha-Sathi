import mongoose, { Schema } from 'mongoose';

const salaryRecordSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  period_start: { type: Date, required: true },
  period_end: { type: Date, required: true },
  total_hours: { type: Number, required: true },
  gross_salary: { type: Number, required: true },
  deductions: { type: Number, default: 0 },
  net_salary: { type: Number, required: true }
}, { timestamps: true });

export const SalaryRecord = mongoose.model('SalaryRecord', salaryRecordSchema);
