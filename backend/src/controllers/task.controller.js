/**
 * ============================================
 * TASK CONTROLLER
 * ============================================
 * 
 * Handles CRUD operations for Task management.
 */

import { Task } from '../models/task.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// CREATE a Task
const createTask = asyncHandler(async (req, res) => {
    const { taskName, description } = req.body;
    if (!taskName || !description) throw new ApiError(400, "All fields required");
    const exists = await Task.findOne({ taskName });
    if (exists) throw new ApiError(409, "Task already exists");
    const task = await Task.create({ taskName, description });
    res.status(201).json(new ApiResponse(201, task, "Task created"));
});

// GET all Tasks (with simple optional pagination)
const getAllTasks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const tasks = await Task.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const totalTasks = await Task.countDocuments();
    const totalPages = Math.ceil(totalTasks / limit);
    res.status(200).json(
        new ApiResponse(200, { tasks, pagination: { page, limit, totalPages, totalTasks } }, "Tasks fetched")
    );
});

// GET a single Task by ID
const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) throw new ApiError(404, "Task not found");
    res.status(200).json(new ApiResponse(200, task, "Task fetched"));
});

// UPDATE a Task by ID
const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { taskName, description } = req.body;
    if (!taskName && !description) throw new ApiError(400, "Nothing to update");
    const data = {};
    if (taskName) data.taskName = taskName;
    if (description) data.description = description;
    const updated = await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, "Task not found");
    res.status(200).json(new ApiResponse(200, updated, "Task updated"));
});

// DELETE a Task by ID
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Task not found");
    res.status(200).json(new ApiResponse(200, {}, "Task deleted"));
});


export {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
}