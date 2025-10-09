import { HazardAudit } from '../models/hazardAudit.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createHazardAudit = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.report_id || !data.event_type || !data.user_id || !data.event_timestamp)
    throw new ApiError(400, "Missing required fields");
  const audit = await HazardAudit.create(data);
  res.status(201).json(new ApiResponse(201, audit, "Hazard audit recorded"));
});

const getAuditsByReport = asyncHandler(async (req, res) => {
  const { report_id } = req.params;
  const audits = await HazardAudit.find({ report_id }).populate('user_id report_id');
  res.status(200).json(new ApiResponse(200, audits, "Hazard audits fetched"));
});

const updateHazardAudit = asyncHandler(async (req, res) => {
  const updated = await HazardAudit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, "Hazard audit not found");
  res.status(200).json(new ApiResponse(200, updated, "Hazard audit updated"));
});

const deleteHazardAudit = asyncHandler(async (req, res) => {
  const deleted = await HazardAudit.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Hazard audit not found");
  res.status(200).json(new ApiResponse(200, {}, "Hazard audit deleted"));
});

export {
  createHazardAudit,
  getAuditsByReport,
  updateHazardAudit,
  deleteHazardAudit
};
