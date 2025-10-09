/**
 * Checklist Model
 * Represents a checklist template for a specific role & task.
 * Fields: role_id (ref), task_id (ref), name, created_by (ref User), timestamps
 */

import mongoose, { Schema } from 'mongoose';

const checklistSchema = new Schema(
  {
    role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },
    task_id: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export const Checklist = mongoose.model('Checklist', checklistSchema);
