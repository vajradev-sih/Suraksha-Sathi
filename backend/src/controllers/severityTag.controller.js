import { SeverityTag } from '../models/severityTag.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createSeverityTag = asyncHandler(async (req, res) => {
    const { level, description } = req.body;
    if (!level) throw new ApiError(400, 'Level is required');
    if (await SeverityTag.findOne({ level })) throw new ApiError(409, 'Severity tag exists');
    const tag = await SeverityTag.create({ level, description });
    res.status(201).json(new ApiResponse(201, tag, 'Severity tag created'));
});

const getAllSeverityTags = asyncHandler(async (req, res) => {
    const tags = await SeverityTag.find().sort({ level: 1 });
    res.status(200).json(new ApiResponse(200, tags, 'Severity tags fetched'));
});

const getSeverityTagById = asyncHandler(async (req, res) => {
    const tag = await SeverityTag.findById(req.params.id);
    if (!tag) throw new ApiError(404, 'Severity tag not found');
    res.status(200).json(new ApiResponse(200, tag, 'Severity tag fetched'));
});

const updateSeverityTag = asyncHandler(async (req, res) => {
    const updated = await SeverityTag.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, 'Severity tag not found');
    res.status(200).json(new ApiResponse(200, updated, 'Severity tag updated'));
});

const deleteSeverityTag = asyncHandler(async (req, res) => {
    const deleted = await SeverityTag.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, 'Severity tag not found');
    res.status(200).json(new ApiResponse(200, {}, 'Severity tag deleted'));
});

export {
    createSeverityTag,
    getAllSeverityTags,
    getSeverityTagById,
    updateSeverityTag,
    deleteSeverityTag
}