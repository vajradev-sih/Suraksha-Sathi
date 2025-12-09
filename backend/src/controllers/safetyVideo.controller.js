import { SafetyVideo } from '../models/safetyVideo.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs/promises';

const uploadSafetyVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'File not provided');
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, { 
      folder: 'safety_videos',
      resource_type: 'video'
    });

    // Delete local file after upload
    await fs.unlink(req.file.path);

    // Create safety video record
    const videoData = {
      title: req.body.title || 'Untitled Safety Video',
      description: req.body.description,
      url: result.secure_url,
      thumbnail_url: result.thumbnail_url || result.secure_url.replace(/\.[^.]+$/, '.jpg')
    };

    // Only add external_integration_id if provided
    if (req.body.external_integration_id) {
      videoData.external_integration_id = req.body.external_integration_id;
    }

    const video = await SafetyVideo.create(videoData);

    res.status(201).json(
      new ApiResponse(201, video, 'Safety video uploaded successfully')
    );
  } catch (err) {
    // Clean up file on error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    throw new ApiError(500, `Upload failed: ${err.message}`);
  }
});

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
