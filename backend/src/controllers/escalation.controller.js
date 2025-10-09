import { Escalation } from '../models/escalation.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createEscalation = asyncHandler(async (req, res) => {
  const { report_id, escalation_stage, escalated_at } = req.body;
  if (!report_id || escalation_stage === undefined || !escalated_at)
    throw new ApiError(400, "Missing required fields");
  const escalation = await Escalation.create({ report_id, escalation_stage, escalated_at });
  res.status(201).json(new ApiResponse(201, escalation, "Escalation recorded"));
});

const getEscalationsByReport = asyncHandler(async (req, res) => {
  const { report_id } = req.params;
  const escalations = await Escalation.find({ report_id }).sort({ escalated_at: -1 });
  res.status(200).json(new ApiResponse(200, escalations, "Escalations fetched"));
});

const updateEscalation = asyncHandler(async (req, res) => {
  const updated = await Escalation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, "Escalation not found");
  res.status(200).json(new ApiResponse(200, updated, "Escalation updated"));
});

const deleteEscalation = asyncHandler(async (req, res) => {
  const deleted = await Escalation.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Escalation not found");
  res.status(200).json(new ApiResponse(200, {}, "Escalation deleted"));
});

export {
  createEscalation,
  getEscalationsByReport,
  updateEscalation,
  deleteEscalation
};
