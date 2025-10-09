/**
 * Task Model
 * Stores information about each type of mining/safety task that can be assigned to a user.
 * Example tasks: "Equipment Inspection", "Site Safety Briefing"
 * Fields: taskName (unique, required), description, timestamps
 */

import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema(
  {
    taskName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
