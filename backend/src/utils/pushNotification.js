// Web Push Utility for sending push notifications
import webpush from 'web-push';
import { PushSubscription } from '../models/pushSubscription.model.js';

// VAPID keys configuration
// Generate keys using: npx web-push generate-vapid-keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBjA0IkYriDPIvs2_cVw',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls'
};

webpush.setVapidDetails(
  'mailto:support@suraksha-sathi.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

/**
 * Send push notification to a user
 * @param {String} userId - MongoDB user ID
 * @param {Object} payload - Notification payload
 * @param {String} payload.title - Notification title
 * @param {String} payload.body - Notification body
 * @param {String} payload.icon - Optional icon URL
 * @param {String} payload.badge - Optional badge URL
 * @param {Object} payload.data - Optional data object
 * @param {Array} payload.actions - Optional action buttons
 * @returns {Promise<Object>} - Results of sending notifications
 */
export async function sendPushNotification(userId, payload) {
  try {
    // Get all active subscriptions for the user
    const subscriptions = await PushSubscription.find({ 
      user_id: userId, 
      is_active: true 
    });

    if (subscriptions.length === 0) {
      console.log(`[Push] No active subscriptions for user ${userId}`);
      return { success: 0, failed: 0, total: 0 };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || 'Suraksha Sathi',
      body: payload.body || '',
      icon: payload.icon || '/mine logo.png',
      badge: payload.badge || '/mine logo.png',
      image: payload.image,
      vibrate: payload.vibrate || [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        url: payload.url || '/',
        ...payload.data
      },
      actions: payload.actions || []
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          };

          await webpush.sendNotification(pushSubscription, notificationPayload);
          
          // Update last_used
          await PushSubscription.findByIdAndUpdate(sub._id, { 
            last_used: new Date() 
          });

          return { success: true, subscriptionId: sub._id };
        } catch (error) {
          // Handle expired or invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[Push] Subscription expired, removing: ${sub._id}`);
            await PushSubscription.findByIdAndUpdate(sub._id, { 
              is_active: false 
            });
          }
          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[Push] Sent to user ${userId}: ${successful} success, ${failed} failed`);

    return {
      success: successful,
      failed: failed,
      total: subscriptions.length
    };
  } catch (error) {
    console.error('[Push] Error sending notification:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple users
 * @param {Array<String>} userIds - Array of user IDs
 * @param {Object} payload - Notification payload
 * @returns {Promise<Object>} - Aggregated results
 */
export async function sendPushNotificationToMultiple(userIds, payload) {
  const results = await Promise.allSettled(
    userIds.map(userId => sendPushNotification(userId, payload))
  );

  const aggregated = results.reduce(
    (acc, result) => {
      if (result.status === 'fulfilled') {
        acc.success += result.value.success;
        acc.failed += result.value.failed;
        acc.total += result.value.total;
      }
      return acc;
    },
    { success: 0, failed: 0, total: 0 }
  );

  return aggregated;
}

/**
 * Send notification to all users with a specific role
 * @param {String} role - User role
 * @param {Object} payload - Notification payload
 * @returns {Promise<Object>} - Aggregated results
 */
export async function sendPushNotificationByRole(role, payload) {
  try {
    const { User } = await import('../models/user.model.js');
    const users = await User.find({ role }).select('_id');
    const userIds = users.map(u => u._id.toString());
    return await sendPushNotificationToMultiple(userIds, payload);
  } catch (error) {
    console.error('[Push] Error sending notification by role:', error);
    throw error;
  }
}

/**
 * Get VAPID public key for client subscription
 * @returns {String} - VAPID public key
 */
export function getVapidPublicKey() {
  return vapidKeys.publicKey;
}

export { webpush };
