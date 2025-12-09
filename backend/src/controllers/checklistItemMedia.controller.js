import { ChecklistItemMedia } from '../models/checklistItemMedia.model.js';
import { ChecklistItem } from '../models/checklistItem.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

const uploadChecklistItemMedia = asyncHandler(async (req, res) => {
  console.log('[CHECKLIST-MEDIA] Upload request received');
  console.log('[CHECKLIST-MEDIA] Body:', req.body);
  console.log('[CHECKLIST-MEDIA] File:', req.file ? req.file.fieldname : 'No file');
  
  if (!req.file) {
    throw new ApiError(400, 'File not provided');
  }

  const { checklist_item_id, media_purpose, language_code, uploaded_by } = req.body;
  
  if (!checklist_item_id) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(400, 'Checklist item ID is required');
  }
  
  // Verify checklist item exists
  const checklistItem = await ChecklistItem.findById(checklist_item_id);
  if (!checklistItem) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(404, 'Checklist item not found');
  }

  console.log('[CHECKLIST-MEDIA] Uploading to Cloudinary...');
  const result = await cloudinary.uploader.upload(req.file.path, { 
    folder: 'checklist_item_media',
    resource_type: 'auto'
  });
  
  await fs.unlink(req.file.path).catch(() => {});
  console.log('[CHECKLIST-MEDIA] File uploaded to Cloudinary');

  const media = await ChecklistItemMedia.create({
    checklist_item_id,
    media_type: req.file.mimetype.split('/')[0],
    url: result.secure_url,
    media_purpose: media_purpose || 'completion_proof', // 'equipment_reference' or 'completion_proof'
    language_code: language_code || 'en',
    uploaded_by: uploaded_by || req.user?._id
  });

  console.log('[CHECKLIST-MEDIA] Media record created');
  res.status(201).json(new ApiResponse(201, media, 'Checklist item media uploaded successfully'));
});

const getAllChecklistItemMedia = asyncHandler(async (req, res) => {
  const { checklist_item_id, media_purpose } = req.query;
  
  const filter = {};
  if (checklist_item_id) filter.checklist_item_id = checklist_item_id;
  if (media_purpose) filter.media_purpose = media_purpose;
  
  const media = await ChecklistItemMedia.find(filter)
    .populate('checklist_item_id')
    .populate('uploaded_by', 'username fullname role')
    .sort({ createdAt: -1 });
    
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
