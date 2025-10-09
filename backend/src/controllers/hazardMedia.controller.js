import { HazardMedia } from '../models/hazardMedia.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

const uploadHazardMedia = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'File not provided');

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'hazard_media' });
    await fs.unlink(req.file.path);

    const media = await HazardMedia.create({
      report_id: req.body.report_id,
      media_type: req.file.mimetype.split('/')[0],
      language_code: req.body.language_code || '',
      url: result.secure_url
    });

    res.status(201).json({ message: 'Hazard media uploaded', data: media });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

const getAllHazardMedia = asyncHandler(async (req, res) => {
  const media = await HazardMedia.find().populate('report_id');
  res.status(200).json(new ApiResponse(200, media, 'Hazard media fetched'));
});

const getHazardMediaById = asyncHandler(async (req, res) => {
  const media = await HazardMedia.findById(req.params.id);
  if (!media) throw new ApiError(404, 'Hazard media not found');
  res.status(200).json(new ApiResponse(200, media, 'Hazard media fetched'));
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
  updateHazardMedia,
  deleteHazardMedia
};
