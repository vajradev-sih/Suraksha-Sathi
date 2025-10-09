import { HazardReport } from '../models/hazardReport.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createHazardReport = asyncHandler(async (req, res) => {
    const data = req.body;
    if (!data.user_id || !data.reported_at || !data.location || !data.category_id || !data.severity_id)
        throw new ApiError(400, 'Missing mandatory fields');
    const report = await HazardReport.create(data);
    res.status(201).json(new ApiResponse(201, report, 'Hazard report created'));
});

const getAllHazardReports = asyncHandler(async (req, res) => {
    const reports = await HazardReport.find().populate('user_id category_id severity_id').sort({ reported_at: -1 });
    res.status(200).json(new ApiResponse(200, reports, 'Hazard reports fetched'));
});

const getHazardReportById = asyncHandler(async (req, res) => {
    const report = await HazardReport.findById(req.params.id).populate('user_id category_id severity_id');
    if (!report) throw new ApiError(404, 'Hazard report not found');
    res.status(200).json(new ApiResponse(200, report, 'Hazard report fetched'));
});

const updateHazardReport = asyncHandler(async (req, res) => {
    const updated = await HazardReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, 'Hazard report not found');
    res.status(200).json(new ApiResponse(200, updated, 'Hazard report updated'));
});

const deleteHazardReport = asyncHandler(async (req, res) => {
    const deleted = await HazardReport.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, 'Hazard report not found');
    res.status(200).json(new ApiResponse(200, {}, 'Hazard report deleted'));
});

export {
    createHazardReport,
    getAllHazardReports,
    getHazardReportById,
    updateHazardReport,
    deleteHazardReport
}

