import { ExternalIntegration } from '../models/externalIntegration.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ----------- External Integration CRUD -----------

// Create external integration
const createExternalIntegration = asyncHandler(async (req, res) => {
  const { name, type, api_endpoint } = req.body;
  if (!name || !type || !api_endpoint) throw new ApiError(400, "All fields required");
  const exists = await ExternalIntegration.findOne({ name });
  if (exists) throw new ApiError(409, "External Integration already exists");
  const external = await ExternalIntegration.create({ name, type, api_endpoint });
  res.status(201).json(new ApiResponse(201, external, "External Integration created"));
});

// Get all external integrations
const getAllExternalIntegrations = asyncHandler(async (req, res) => {
  const externals = await ExternalIntegration.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, externals, "External Integrations fetched"));
});

// Update external integration by id
const updateExternalIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = await ExternalIntegration.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, "External Integration not found");
  res.status(200).json(new ApiResponse(200, updated, "External Integration updated"));
});

// Delete external integration by id
const deleteExternalIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ExternalIntegration.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "External Integration not found");
  res.status(200).json(new ApiResponse(200, {}, "External Integration deleted"));
});


export {
  createExternalIntegration,
  getAllExternalIntegrations,
  updateExternalIntegration,
  deleteExternalIntegration
}