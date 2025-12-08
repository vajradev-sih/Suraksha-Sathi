import { Router } from 'express';
import {
  getRecommendedVideos,
  getPersonalizedFeed,
  getSimilarVideos
} from '../controllers/recommendation.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Recommendation endpoints
router.get('/videos', getRecommendedVideos);
router.get('/feed', getPersonalizedFeed);
router.get('/similar/:videoId', getSimilarVideos);

export default router;
