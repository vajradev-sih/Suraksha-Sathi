import mongoose, { Schema } from 'mongoose';

const checklistItemMediaSchema = new Schema({
  checklist_item_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChecklistItem', 
    required: true 
  },
  media_type: { 
    type: String, 
    required: true,
    enum: ['image', 'video', 'audio']
  },
  url: { 
    type: String, 
    required: true 
  },
  media_purpose: {
    type: String,
    enum: ['equipment_reference', 'completion_proof'],
    default: 'completion_proof',
    required: true
  },
  language_code: { 
    type: String,
    default: 'en'
  },
  uploaded_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export const ChecklistItemMedia = mongoose.model('ChecklistItemMedia', checklistItemMediaSchema);
