import mongoose, { Schema } from 'mongoose';

const attendanceSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  check_in_time: { type: Date, required: true },
  check_out_time: { type: Date },
  shift_date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'holiday'], default: 'present' }
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
