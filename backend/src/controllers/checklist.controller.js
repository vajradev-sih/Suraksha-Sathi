/**
 * ============================================
 * CHECKLIST CONTROLLER
 * ============================================
 * 
 * Handles CRUD operations for Checklist management.
 */
import { Checklist } from '../models/checklist.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { log } from 'console';

// CREATE a Checklist
const createChecklist = asyncHandler(async (req, res) => {
    const { role_id, task_id, name, created_by } = req.body;
    
    
    if (!role_id || !task_id || !name || !created_by)
        throw new ApiError(400, "All fields required");
    const exists = await Checklist.findOne({ name, role_id, task_id });
    if (exists) throw new ApiError(409, "Checklist already exists for this role and task");
    const checklist = await Checklist.create({ role_id, task_id, name, created_by });
    
    res.status(201).json(new ApiResponse(201, checklist, "Checklist created"));
});

// GET all Checklists (optional filters for role/task)
const getAllChecklists = asyncHandler(async (req, res) => {
    const { role_id, task_id, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (role_id) filter.role_id = role_id;
    if (task_id) filter.task_id = task_id;
    const skip = (page - 1) * limit;
    const checklists = await Checklist.find(filter)
        .populate('role_id task_id created_by')
        .skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Checklist.countDocuments(filter);
    res.status(200).json(
        new ApiResponse(200, {
            checklists,
            pagination: { page, limit, total }
        }, "Checklists fetched")
    );
});

// GET a single Checklist by ID
const getChecklistById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const checklist = await Checklist.findById(id)
        .populate('role_id task_id created_by');
    if (!checklist) throw new ApiError(404, "Checklist not found");
    res.status(200).json(new ApiResponse(200, checklist, "Checklist fetched"));
});

// UPDATE a Checklist by ID
const updateChecklist = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) throw new ApiError(400, "Nothing to update");
    const updated = await Checklist.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, "Checklist not found");
    res.status(200).json(new ApiResponse(200, updated, "Checklist updated"));
});

// DELETE a Checklist by ID
const deleteChecklist = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Checklist.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Checklist not found");
    res.status(200).json(new ApiResponse(200, {}, "Checklist deleted"));
});

export {
    createChecklist,
    getAllChecklists,
    getChecklistById,
    updateChecklist,
    deleteChecklist
}
