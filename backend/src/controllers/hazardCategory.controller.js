import { HazardCategory } from '../models/hazardCategory.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Create Hazard Category
const createHazardCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) throw new ApiError(400, "Name is required");
    const exists = await HazardCategory.findOne({ name });
    if (exists) throw new ApiError(409, "Hazard category already exists");
    const category = await HazardCategory.create({ name, description });
    res.status(201).json(new ApiResponse(201, category, "Hazard category created"));
});

// Get All Hazard Categories
const getAllHazardCategories = asyncHandler(async (req, res) => {
    const categories = await HazardCategory.find().sort({ name: 1 });
    res.status(200).json(new ApiResponse(200, categories, "Hazard categories fetched"));
});

// Get Category by ID
const getHazardCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await HazardCategory.findById(id);
    if (!category) throw new ApiError(404, "Category not found");
    res.status(200).json(new ApiResponse(200, category, "Category fetched"));
});

// Update Hazard Category
const updateHazardCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name && !description) throw new ApiError(400, 'Nothing to update');
    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    const updated = await HazardCategory.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, "Category not found");
    res.status(200).json(new ApiResponse(200, updated, "Category updated"));
});

// Delete Hazard Category
const deleteHazardCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await HazardCategory.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Category not found");
    res.status(200).json(new ApiResponse(200, {}, "Category deleted"));
});

export {
    createHazardCategory,
    getAllHazardCategories,
    getHazardCategoryById,
    updateHazardCategory,
    deleteHazardCategory

}

