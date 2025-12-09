import { Router } from 'express';
import {
  uploadSafetyVideo,
  getAllSafetyVideos,
  getSafetyVideoById,
  updateSafetyVideo,
  deleteSafetyVideo
} from '../controllers/safetyVideo.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

// Apply authentication to all routes
router.use(verifyJWT);

// Admin/SafetyOfficer only routes
router.post('/upload', authorizeRoles('Admin', 'TrainingOfficer'), upload.single('file'), uploadSafetyVideo);
router.put('/:id', authorizeRoles('Admin', 'TrainingOfficer'), updateSafetyVideo);
router.delete('/:id', authorizeRoles('Admin', 'TrainingOfficer'), deleteSafetyVideo);

// Authenticated user routes
router.get('/', getAllSafetyVideos);
router.get('/:id', getSafetyVideoById);

export default router;
