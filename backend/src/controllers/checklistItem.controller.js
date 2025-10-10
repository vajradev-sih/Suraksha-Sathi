/**
 * ============================================
 * CHECKLIST ITEM CONTROLLER
 * ============================================
 * Handle CRUD for individual checklist items attached to a checklist.
 */
import { ChecklistItem } from '../models/checklistItem.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// CREATE a checklist item
const createChecklistItem = asyncHandler(async (req, res) => {
    const { checklist_id, description, is_mandatory, order } = req.body;
    if (!checklist_id || !description || (order === undefined))
        throw new ApiError(400, "All fields required");
    const item = await ChecklistItem.create({
        checklist_id, description, is_mandatory, order
    });
    res.status(201).json(new ApiResponse(201, item, "Checklist item created"));
});

// GET all items for a checklist
const getItemsForChecklist = asyncHandler(async (req, res) => {
    const { checklist_id } = req.query;
    if (!checklist_id) throw new ApiError(400, "Checklist ID required");
    const items = await ChecklistItem.find({ checklist_id }).sort({ order: 1 });
    res.status(200).json(new ApiResponse(200, items, "Checklist items fetched"));
});

// GET single checklist item by id
const getChecklistItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await ChecklistItem.findById(id);
    if (!item) throw new ApiError(404, "Checklist item not found");
    res.status(200).json(new ApiResponse(200, item, "Checklist item fetched"));
});

// UPDATE checklist item
const updateChecklistItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, is_mandatory, order } = req.body;
    if (description === undefined && is_mandatory === undefined && order === undefined)
        throw new ApiError(400, "No update fields provided");
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (is_mandatory !== undefined) updates.is_mandatory = is_mandatory;
    if (order !== undefined) updates.order = order;
    const updated = await ChecklistItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, "Checklist item not found");
    res.status(200).json(new ApiResponse(200, updated, "Checklist item updated"));
});

// DELETE checklist item
const deleteChecklistItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await ChecklistItem.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Checklist item not found");
    res.status(200).json(new ApiResponse(200, {}, "Checklist item deleted"));
});


export {
    createChecklistItem,
    getItemsForChecklist, // Corrected export
    getChecklistItemById,
    updateChecklistItem,
    deleteChecklistItem
}