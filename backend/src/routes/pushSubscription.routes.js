// Push Subscription Routes
import { Router } from 'express';
import {
  getPublicKey,
  subscribe,
  unsubscribe,
  getUserSubscriptions,
  sendTestNotification,
  sendNotificationToUser,
  cleanupSubscriptions
} from '../controllers/pushSubscription.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

// Public endpoint - get VAPID public key
router.get('/public-key', getPublicKey);

// Protected endpoints - require authentication
router.post('/subscribe', verifyJWT, subscribe);
router.post('/unsubscribe', verifyJWT, unsubscribe);
router.get('/subscriptions', verifyJWT, getUserSubscriptions);
router.post('/test', verifyJWT, sendTestNotification);

// Admin endpoints
router.post('/send', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), sendNotificationToUser);
router.delete('/cleanup', verifyJWT, authorizeRoles('Admin'), cleanupSubscriptions);

export default router;
