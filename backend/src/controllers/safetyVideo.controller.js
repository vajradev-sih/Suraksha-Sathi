import { SafetyVideo } from '../models/safetyVideo.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

const uploadSafetyVideo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File not provided' });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'safety_videos' });

    // Delete local file after upload
    await fs.unlink(req.file.path);

    // Save the safety video record as usual here

    res.status(201).json({ message: 'Safety video uploaded', url: result.secure_url });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(err);
  }
};

const getAllSafetyVideos = asyncHandler(async (req, res) => {
  const videos = await SafetyVideo.find().populate('external_integration_id').sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, videos, 'Safety videos fetched'));
});

const getSafetyVideoById = asyncHandler(async (req, res) => {
  const video = await SafetyVideo.findById(req.params.id);
  if (!video) throw new ApiError(404, 'Safety video not found');
  res.status(200).json(new ApiResponse(200, video, 'Safety video fetched'));
});

const updateSafetyVideo = asyncHandler(async (req, res) => {
  const updated = await SafetyVideo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ApiError(404, 'Safety video not found');
  res.status(200).json(new ApiResponse(200, updated, 'Safety video updated'));
});

const deleteSafetyVideo = asyncHandler(async (req, res) => {
  const deleted = await SafetyVideo.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Safety video not found');
  res.status(200).json(new ApiResponse(200, {}, 'Safety video deleted'));
});

export {
  uploadSafetyVideo,
  getAllSafetyVideos,
  getSafetyVideoById,
  updateSafetyVideo,
  deleteSafetyVideo
};
