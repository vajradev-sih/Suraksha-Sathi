// Push Subscription Controller
import { PushSubscription } from '../models/pushSubscription.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendPushNotification, getVapidPublicKey } from '../utils/pushNotification.js';

/**
 * Get VAPID public key for client-side subscription
 */
const getPublicKey = asyncHandler(async (req, res) => {
  const publicKey = getVapidPublicKey();
  res.status(200).json(new ApiResponse(200, { publicKey }, 'VAPID public key retrieved'));
});

/**
 * Subscribe user to push notifications
 */
const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys, device_type, browser } = req.body;
  const user_id = req.user?._id || req.user?.id;

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    throw new ApiError(400, 'Invalid subscription data');
  }

  if (!user_id) {
    throw new ApiError(401, 'User not authenticated');
  }

  // Check if subscription already exists
  const existingSub = await PushSubscription.findOne({ endpoint });

  if (existingSub) {
    // Update existing subscription
    existingSub.user_id = user_id;
    existingSub.keys = keys;
    existingSub.device_type = device_type;
    existingSub.browser = browser;
    existingSub.is_active = true;
    existingSub.last_used = new Date();
    await existingSub.save();

    res.status(200).json(new ApiResponse(200, existingSub, 'Subscription updated'));
  } else {
    // Create new subscription
    const subscription = await PushSubscription.create({
      user_id,
      endpoint,
      keys,
      device_type,
      browser,
      is_active: true
    });

    res.status(201).json(new ApiResponse(201, subscription, 'Subscribed to push notifications'));
  }
});

/**
 * Unsubscribe from push notifications
 */
const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  const user_id = req.user?._id || req.user?.id;

  if (!endpoint) {
    throw new ApiError(400, 'Endpoint required');
  }

  const subscription = await PushSubscription.findOne({ endpoint, user_id });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  subscription.is_active = false;
  await subscription.save();

  res.status(200).json(new ApiResponse(200, {}, 'Unsubscribed from push notifications'));
});

/**
 * Get user's active subscriptions
 */
const getUserSubscriptions = asyncHandler(async (req, res) => {
  const user_id = req.user?._id || req.user?.id;

  const subscriptions = await PushSubscription.find({ 
    user_id, 
    is_active: true 
  }).select('-keys'); // Don't expose keys

  res.status(200).json(new ApiResponse(200, subscriptions, 'User subscriptions retrieved'));
});

/**
 * Send test notification to user
 */
const sendTestNotification = asyncHandler(async (req, res) => {
  const user_id = req.user?._id || req.user?.id;

  const result = await sendPushNotification(user_id, {
    title: 'Test Notification',
    body: 'This is a test notification from Suraksha Sathi',
    icon: '/mine logo.png',
    data: {
      type: 'test',
      timestamp: Date.now()
    }
  });

  res.status(200).json(new ApiResponse(200, result, 'Test notification sent'));
});

/**
 * Send notification to specific user (Admin only)
 */
const sendNotificationToUser = asyncHandler(async (req, res) => {
  const { userId, title, body, url, data } = req.body;

  if (!userId || !title || !body) {
    throw new ApiError(400, 'userId, title, and body are required');
  }

  const result = await sendPushNotification(userId, {
    title,
    body,
    url,
    data
  });

  res.status(200).json(new ApiResponse(200, result, 'Notification sent'));
});

/**
 * Clean up expired/inactive subscriptions (Admin only)
 */
const cleanupSubscriptions = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await PushSubscription.deleteMany({
    is_active: false,
    updatedAt: { $lt: thirtyDaysAgo }
  });

  res.status(200).json(new ApiResponse(200, result, `Cleaned up ${result.deletedCount} subscriptions`));
});

export {
  getPublicKey,
  subscribe,
  unsubscribe,
  getUserSubscriptions,
  sendTestNotification,
  sendNotificationToUser,
  cleanupSubscriptions
};
