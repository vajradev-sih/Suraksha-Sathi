import mongoose, { Schema } from 'mongoose';

const userTaskAssignmentSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  assigned_date: { type: Date, required: true, default: Date.now },
  due_date: { type: Date }
}, { timestamps: true });

export const UserTaskAssignment = mongoose.model('UserTaskAssignment', userTaskAssignmentSchema);
