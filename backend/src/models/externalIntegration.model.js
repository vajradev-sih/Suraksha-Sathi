import mongoose, { Schema } from 'mongoose';

const externalIntegrationSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },          // e.g., "YouTube", "Vimeo"
  api_endpoint: { type: String, required: true }
}, { timestamps: true });

export const ExternalIntegration = mongoose.model('ExternalIntegration', externalIntegrationSchema);
