// ----------- Daily Video CRUD -----------
import { DailyVideo } from '../models/dailyVideo.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Assign daily video to user
const assignDailyVideo = asyncHandler(async (req, res) => {
  const { user_id, video_id, assigned_date } = req.body;
  if (!user_id || !video_id || !assigned_date) throw new ApiError(400, "All fields required");
  const exists = await DailyVideo.findOne({ user_id, video_id, assigned_date });
  if (exists) throw new ApiError(409, "Daily video already assigned");
  const dailyVideo = await DailyVideo.create({ user_id, video_id, assigned_date });
  res.status(201).json(new ApiResponse(201, dailyVideo, "Daily Video assigned"));
});

// Get daily videos for user
const getDailyVideosForUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const videos = await DailyVideo.find({ user_id }).populate('video_id').sort({ assigned_date: -1 });
  res.status(200).json(new ApiResponse(200, videos, "Daily Videos fetched"));
});

// Mark daily video watched with date
const markDailyVideoWatched = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { watched, watched_date } = req.body;
  const updated = await DailyVideo.findByIdAndUpdate(id, { watched, watched_date }, { new: true });
  if (!updated) throw new ApiError(404, "Daily Video not found");
  res.status(200).json(new ApiResponse(200, updated, "Daily Video updated"));
});

export {
  assignDailyVideo,
  getDailyVideosForUser,
  markDailyVideoWatched
}
