import { Router } from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getUserProfile,
  getSuggestedUsers
} from '../controllers/follow.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Follow/Unfollow operations
router.post('/:userId/follow', followUser);
router.delete('/:userId/unfollow', unfollowUser);

// Get followers and following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/my/followers', getFollowers);
router.get('/my/following', getFollowing);

// Check follow status
router.get('/:userId/check', checkFollowStatus);

// User profile with social stats
router.get('/:userId/profile', getUserProfile);

// Suggestions
router.get('/suggestions/users', getSuggestedUsers);

export default router;
