import { HazardMedia } from '../models/hazardMedia.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

const uploadHazardMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'File not provided');

  const result = await cloudinary.uploader.upload(req.file.path, { 
    folder: 'hazard_media',
    resource_type: 'auto' // Automatically detect resource type (image, video, raw for audio)
  });
  await fs.unlink(req.file.path).catch(() => {});

  // Determine media type from mimetype
  let mediaType = req.body.media_type;
  if (!mediaType) {
    const mimeType = req.file.mimetype;
    if (mimeType.startsWith('image/')) mediaType = 'photo';
    else if (mimeType.startsWith('video/')) mediaType = 'video';
    else if (mimeType.startsWith('audio/')) mediaType = 'audio';
    else mediaType = 'file';
  }

  const media = await HazardMedia.create({
    report_id: req.body.report_id,
    media_type: mediaType,
    language_code: req.body.language_code || '',
    url: result.secure_url,
    duration: req.body.duration ? parseInt(req.body.duration) : null,
    file_size: req.file.size,
    mime_type: req.file.mimetype
  });

  res.status(201).json(new ApiResponse(201, media, 'Hazard media uploaded'));
});

const getAllHazardMedia = asyncHandler(async (req, res) => {
  const media = await HazardMedia.find().populate('report_id');
  res.status(200).json(new ApiResponse(200, media, 'Hazard media fetched'));
});

const getHazardMediaById = asyncHandler(async (req, res) => {
  const media = await HazardMedia.findById(req.params.id);
  if (!media) throw new ApiError(404, 'Hazard media not found');
  res.status(200).json(new ApiResponse(200, media, 'Hazard media fetched'));
});

const getHazardMediaByReportId = asyncHandler(async (req, res) => {
  const media = await HazardMedia.find({ report_id: req.params.reportId });
  res.status(200).json(new ApiResponse(200, media, 'Hazard media fetched for report'));
});

const updateHazardMedia = asyncHandler(async (req, res) => {
  const updated = await HazardMedia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, 'Hazard media not found');
  res.status(200).json(new ApiResponse(200, updated, 'Hazard media updated'));
});

const deleteHazardMedia = asyncHandler(async (req, res) => {
  const deleted = await HazardMedia.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Hazard media not found');
  res.status(200).json(new ApiResponse(200, {}, 'Hazard media deleted'));
});

export {
  uploadHazardMedia,
  getAllHazardMedia,
  getHazardMediaById,
  getHazardMediaByReportId,
  updateHazardMedia,
  deleteHazardMedia
};
