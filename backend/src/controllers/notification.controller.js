import { Notification } from '../models/notification.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createNotification = asyncHandler(async (req, res) => {
  const { user_id, report_id, notification_type, sent_at } = req.body;
  if (!user_id || !notification_type) throw new ApiError(400, "Missing required fields");
  const notification = await Notification.create({ user_id, report_id, notification_type, sent_at });
  res.status(201).json(new ApiResponse(201, notification, "Notification created"));
});

const getNotificationsForUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const notifications = await Notification.find({ user_id }).sort({ sent_at: -1 });
  res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { read_at: new Date() }, { new: true });
  if (!updated) throw new ApiError(404, "Notification not found");
  res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});

export {
  createNotification,
  getNotificationsForUser,
  markAsRead
};
