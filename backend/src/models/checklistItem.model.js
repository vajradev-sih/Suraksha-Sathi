/**
 * Checklist Item Model
 * Each document is a single step/criteria inside a checklist.
 * Fields: checklist_id (ref), description, is_mandatory, order, timestamps
 */

import mongoose, { Schema } from 'mongoose';

const checklistItemSchema = new Schema(
  {
    checklist_id: {
      type: Schema.Types.ObjectId,
      ref: 'Checklist',
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    is_mandatory: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const ChecklistItem = mongoose.model('ChecklistItem', checklistItemSchema);
