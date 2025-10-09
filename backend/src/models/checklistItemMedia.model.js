import mongoose, { Schema } from 'mongoose';

const checklistItemMediaSchema = new Schema({
  checklist_item_id: { type: Schema.Types.ObjectId, ref: 'ChecklistItem', required: true },
  media_type: { type: String, required: true }, // e.g., image, video
  url: { type: String, required: true },
  language_code: { type: String }
}, { timestamps: true });

export const ChecklistItemMedia = mongoose.model('ChecklistItemMedia', checklistItemMediaSchema);
