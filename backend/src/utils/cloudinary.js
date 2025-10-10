import cloudinary from '../utils/cloudinary.js';  // Import Cloudinary from your utils
import fs from 'fs';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HazardMedia } from '../models/hazardMedia.model.js';

const uploadHazardMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, { folder: 'hazard_media' });

  // Remove local file
  fs.unlinkSync(req.file.path);

  // Save media info in DB
  const media = await HazardMedia.create({
    report_id: req.body.report_id,
    media_type: req.file.mimetype.split('/')[0],
    language_code: req.body.language_code || '',
    url: result.secure_url
  });

  res.status(201).json(new ApiResponse(201, media, 'Media uploaded successfully'));
});

export default uploadHazardMedia
