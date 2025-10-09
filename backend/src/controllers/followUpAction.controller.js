import { FollowUpAction } from '../models/followUpAction.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createFollowUpAction = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.report_id || !data.action_by_id || !data.action_date) throw new ApiError(400, "Missing required fields");
  const action = await FollowUpAction.create(data);
  res.status(201).json(new ApiResponse(201, action, "Follow up action recorded"));
});

const getFollowUpsByReport = asyncHandler(async (req, res) => {
  const { report_id } = req.params;
  const actions = await FollowUpAction.find({ report_id }).populate('action_by_id report_id');
  res.status(200).json(new ApiResponse(200, actions, "Follow ups fetched"));
});

const updateFollowUpAction = asyncHandler(async (req, res) => {
  const updated = await FollowUpAction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, "Follow up action not found");
  res.status(200).json(new ApiResponse(200, updated, "Follow up action updated"));
});

const deleteFollowUpAction = asyncHandler(async (req, res) => {
  const deleted = await FollowUpAction.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Follow up action not found");
  res.status(200).json(new ApiResponse(200, {}, "Follow up action deleted"));
});

export {
  createFollowUpAction,
  getFollowUpsByReport,
  updateFollowUpAction,
  deleteFollowUpAction
};
