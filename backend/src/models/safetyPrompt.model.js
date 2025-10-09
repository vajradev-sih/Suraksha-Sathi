import mongoose, { Schema } from 'mongoose';

const safetyPromptSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignment_id: { type: Schema.Types.ObjectId, ref: 'UserTaskAssignment', required: true },
  checklist_id: { type: Schema.Types.ObjectId, ref: 'Checklist', required: true },
  scheduled_date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

export const SafetyPrompt = mongoose.model('SafetyPrompt', safetyPromptSchema);
