/**
 * ============================================
 * CHECKLIST ITEM CONTROLLER
 * ============================================
 * Handle CRUD for individual checklist items attached to a checklist.
 */
import { ChecklistItem } from '../models/checklistItem.model.js';
import { ChecklistItemMedia } from '../models/checklistItemMedia.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

// CREATE a checklist item with optional equipment image
const createChecklistItem = asyncHandler(async (req, res) => {
    const { checklist_id, description, is_mandatory, order, equipment_image_url } = req.body;
    if (!checklist_id || !description || (order === undefined))
        throw new ApiError(400, "checklist_id, description, and order are required");
    
    const itemData = {
        checklist_id, 
        description, 
        is_mandatory, 
        order,
        created_by: req.user?._id
    };
    
    // If equipment image URL provided, add it
    if (equipment_image_url) {
        itemData.equipment_image_url = equipment_image_url;
    }
    
    const item = await ChecklistItem.create(itemData);
    res.status(201).json(new ApiResponse(201, item, "Checklist item created"));
});

// GET all items for a checklist with media
const getItemsForChecklist = asyncHandler(async (req, res) => {
    const { checklist_id } = req.query;
    if (!checklist_id) throw new ApiError(400, "Checklist ID required");
    
    const items = await ChecklistItem.find({ checklist_id })
        .populate('created_by', 'username fullname')
        .sort({ order: 1 });
    
    // Fetch associated media for each item
    const itemsWithMedia = await Promise.all(items.map(async (item) => {
        const media = await ChecklistItemMedia.find({ checklist_item_id: item._id })
            .populate('uploaded_by', 'username fullname role')
            .sort({ createdAt: -1 });
        
        return {
            ...item.toObject(),
            media
        };
    }));
    
    res.status(200).json(new ApiResponse(200, itemsWithMedia, "Checklist items fetched"));
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
    const { description, is_mandatory, order, equipment_image_url } = req.body;
    
    if (description === undefined && is_mandatory === undefined && 
        order === undefined && equipment_image_url === undefined)
        throw new ApiError(400, "No update fields provided");
    
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (is_mandatory !== undefined) updates.is_mandatory = is_mandatory;
    if (order !== undefined) updates.order = order;
    if (equipment_image_url !== undefined) updates.equipment_image_url = equipment_image_url;
    
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

// CREATE checklist item with equipment image upload
const createChecklistItemWithImage = asyncHandler(async (req, res) => {
    const { checklist_id, description, is_mandatory, order } = req.body;
    
    if (!checklist_id || !description || (order === undefined))
        throw new ApiError(400, "checklist_id, description, and order are required");
    
    let equipment_image_url = null;
    
    // If file uploaded, upload to Cloudinary
    if (req.file) {
        console.log('[CHECKLIST-ITEM] Uploading equipment image to Cloudinary...');
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'checklist_equipment_images',
            resource_type: 'image'
        });
        equipment_image_url = result.secure_url;
        await fs.unlink(req.file.path).catch(() => {});
        console.log('[CHECKLIST-ITEM] Equipment image uploaded');
    }
    
    const item = await ChecklistItem.create({
        checklist_id,
        description,
        is_mandatory,
        order,
        equipment_image_url,
        created_by: req.user?._id
    });
    
    res.status(201).json(new ApiResponse(201, item, "Checklist item created with equipment image"));
});

// UPDATE checklist item with new equipment image
const updateChecklistItemWithImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, is_mandatory, order } = req.body;
    
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (is_mandatory !== undefined) updates.is_mandatory = is_mandatory;
    if (order !== undefined) updates.order = order;
    
    // If new file uploaded, upload to Cloudinary
    if (req.file) {
        console.log('[CHECKLIST-ITEM] Uploading new equipment image to Cloudinary...');
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'checklist_equipment_images',
            resource_type: 'image'
        });
        updates.equipment_image_url = result.secure_url;
        await fs.unlink(req.file.path).catch(() => {});
        console.log('[CHECKLIST-ITEM] Equipment image updated');
    }
    
    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No update fields provided");
    }
    
    const updated = await ChecklistItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, "Checklist item not found");
    res.status(200).json(new ApiResponse(200, updated, "Checklist item updated"));
});


export {
    createChecklistItem,
    getItemsForChecklist,
    getChecklistItemById,
    updateChecklistItem,
    deleteChecklistItem,
    createChecklistItemWithImage,
    updateChecklistItemWithImage
}