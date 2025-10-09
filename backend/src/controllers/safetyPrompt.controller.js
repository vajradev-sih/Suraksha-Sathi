import { SafetyPrompt } from '../models/safetyPrompt.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Schedule a safety prompt for a user
const schedulePrompt = asyncHandler(async (req, res) => {
    const { user_id, assignment_id, checklist_id, scheduled_date } = req.body;
    if (!user_id || !assignment_id || !checklist_id || !scheduled_date)
        throw new ApiError(400, "All fields are required");

    const existingPrompt = await SafetyPrompt.findOne({ user_id, assignment_id, checklist_id, scheduled_date });
    if (existingPrompt) throw new ApiError(409, "Prompt already scheduled");

    const prompt = await SafetyPrompt.create({ user_id, assignment_id, checklist_id, scheduled_date });
    res.status(201).json(new ApiResponse(201, prompt, "Safety prompt scheduled"));
});

// Get prompts for a user
const getUserPrompts = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const prompts = await SafetyPrompt.find({ user_id }).populate('checklist_id assignment_id');
    res.status(200).json(new ApiResponse(200, prompts, "Safety prompts fetched"));
});

// Update prompt status (e.g., mark as completed)
const updatePromptStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'completed'].includes(status)) throw new ApiError(400, "Invalid status");

    const updatedPrompt = await SafetyPrompt.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedPrompt) throw new ApiError(404, "Prompt not found");

    res.status(200).json(new ApiResponse(200, updatedPrompt, "Prompt status updated"));
});


export {
    schedulePrompt,
    getUserPrompts,
    updatePromptStatus,
    
}