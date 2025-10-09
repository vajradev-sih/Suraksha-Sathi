import { Router } from 'express';
import {
  createNotification,
  getNotificationsForUser,
  markAsRead
} from '../controllers/notification.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, createNotification);
router.get('/user/:user_id', verifyJWT, getNotificationsForUser);
router.put('/:id/read', verifyJWT, markAsRead);

export default router;
