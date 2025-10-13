import { HazardAssignment } from '../models/hazardAssignment.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createHazardAssignment = asyncHandler(async (req, res) => {
  const { report_id, assigned_to_id, assigned_at, due_date, status } = req.body;

  if (!report_id || !assigned_to_id || !assigned_at || !due_date) {
    throw new ApiError(400, "Missing required fields");
  }

  // 🐛 Mongoose Fix: Use { report_id } directly in findOne()
  const existingAssignment = await HazardAssignment.findOne({ report_id });

  if (existingAssignment) {
    throw new ApiError(409, `Report with ID ${report_id} is already assigned (Assignment ID: ${existingAssignment._id})`);
  }

  const assignment = await HazardAssignment.create({ report_id, assigned_to_id, assigned_at, due_date, status });
  res.status(201).json(new ApiResponse(201, assignment, "Hazard assigned successfully"));
});

const getAssignmentsByReport = asyncHandler(async (req, res) => {
  const { report_id } = req.params;
  const assignments = await HazardAssignment.find({ report_id }).populate('assigned_to_id report_id');
  res.status(200).json(new ApiResponse(200, assignments, "Assignments for report fetched"));
});

const updateHazardAssignment = asyncHandler(async (req, res) => {
  const updated = await HazardAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, "Hazard assignment not found");
  res.status(200).json(new ApiResponse(200, updated, "Hazard assignment updated"));
});

const deleteHazardAssignment = asyncHandler(async (req, res) => {
  const deleted = await HazardAssignment.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Hazard assignment not found");
  res.status(200).json(new ApiResponse(200, {}, "Hazard assignment deleted"));
});

export {
  createHazardAssignment,
  getAssignmentsByReport,
  updateHazardAssignment,
  deleteHazardAssignment
};
