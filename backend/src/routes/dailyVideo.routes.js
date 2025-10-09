import { Router } from 'express';
import {
  assignDailyVideo,
  getDailyVideosForUser,
  markDailyVideoWatched
} from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, assignDailyVideo);
router.get('/:user_id', verifyJWT, getDailyVideosForUser);
router.put('/:id', verifyJWT, markDailyVideoWatched);

export default router;
