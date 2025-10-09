import { UserTaskAssignment } from '../models/userTaskAssignment.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Create an assignment of a task to a user
const assignTaskToUser = asyncHandler(async (req, res) => {
    const { user_id, task_id, assigned_date, due_date } = req.body;
    if (!user_id || !task_id) throw new ApiError(400, "user_id and task_id required");

    const existingAssignment = await UserTaskAssignment.findOne({ user_id, task_id, assigned_date });
    if (existingAssignment) throw new ApiError(409, "Assignment already exists for this user and task on this date");

    const assignment = await UserTaskAssignment.create({ user_id, task_id, assigned_date, due_date });
    res.status(201).json(new ApiResponse(201, assignment, "Task assigned to user"));
});

// Get assignments for a user
const getUserAssignments = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const assignments = await UserTaskAssignment.find({ user_id }).populate('task_id');
    res.status(200).json(new ApiResponse(200, assignments, "User assignments fetched"));
});

// Update assignment due date or other details
const updateAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const updatedAssignment = await UserTaskAssignment.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedAssignment) throw new ApiError(404, "Assignment not found");
    res.status(200).json(new ApiResponse(200, updatedAssignment, "Assignment updated"));
});

// Delete assignment
const deleteAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedAssignment = await UserTaskAssignment.findByIdAndDelete(id);
    if (!deletedAssignment) throw new ApiError(404, "Assignment not found");
    res.status(200).json(new ApiResponse(200, {}, "Assignment deleted"));
});


export {
    assignTaskToUser,
    getUserAssignments,
    updateAssignment,
    deleteAssignment
}
