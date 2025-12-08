import { Router } from 'express';
import {
  likeVideo,
  unlikeVideo,
  getMyLikedVideos,
  getVideoLikes,
  checkLikeStatus,
  getPopularVideos
} from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Like/Unlike operations
router.post('/:videoId/like', likeVideo);
router.delete('/:videoId/unlike', unlikeVideo);

// Get likes
router.get('/my-liked-videos', getMyLikedVideos);
router.get('/:videoId/likes', getVideoLikes);
router.get('/:videoId/check', checkLikeStatus);

// Popular videos
router.get('/popular/videos', getPopularVideos);

export default router;
