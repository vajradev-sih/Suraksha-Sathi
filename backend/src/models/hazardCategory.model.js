import mongoose, { Schema } from 'mongoose';

const hazardCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
}, { timestamps: true });

export const HazardCategory = mongoose.model('HazardCategory', hazardCategorySchema);
