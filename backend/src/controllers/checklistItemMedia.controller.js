import { ChecklistItemMedia } from '../models/checklistItemMedia.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

const uploadChecklistItemMedia = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'File not provided');

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'checklist_item_media' });
    await fs.unlink(req.file.path);

    const media = await ChecklistItemMedia.create({
      checklist_item_id: req.body.checklist_item_id,
      media_type: req.file.mimetype.split('/')[0],
      url: result.secure_url,
      language_code: req.body.language_code || ''
    });

    res.status(201).json({ message: 'Checklist item media uploaded', data: media });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

const getAllChecklistItemMedia = asyncHandler(async (req, res) => {
  const media = await ChecklistItemMedia.find().populate('checklist_item_id');
  res.status(200).json(new ApiResponse(200, media, 'Checklist item media fetched'));
});

const getChecklistItemMediaById = asyncHandler(async (req, res) => {
  const media = await ChecklistItemMedia.findById(req.params.id);
  if (!media) throw new ApiError(404, 'Checklist item media not found');
  res.status(200).json(new ApiResponse(200, media, 'Checklist item media fetched'));
});

const updateChecklistItemMedia = asyncHandler(async (req, res) => {
  const updated = await ChecklistItemMedia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, 'Checklist item media not found');
  res.status(200).json(new ApiResponse(200, updated, 'Checklist item media updated'));
});

const deleteChecklistItemMedia = asyncHandler(async (req, res) => {
  const deleted = await ChecklistItemMedia.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Checklist item media not found');
  res.status(200).json(new ApiResponse(200, {}, 'Checklist item media deleted'));
});

export {
  uploadChecklistItemMedia,
  getAllChecklistItemMedia,
  getChecklistItemMediaById,
  updateChecklistItemMedia,
  deleteChecklistItemMedia
};
