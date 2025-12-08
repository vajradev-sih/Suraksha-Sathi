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

router.post('/upload', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), upload.single('file'), uploadSafetyVideo);
router.get('/', verifyJWT, getAllSafetyVideos);
router.get('/:id', verifyJWT, getSafetyVideoById);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), updateSafetyVideo);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), deleteSafetyVideo);

export default router;
