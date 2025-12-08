import { Router } from 'express';
import {
  uploadWorkerVideo,
  approveVideo,
  rejectVideo,
  getAllWorkerVideos,
  getPendingVideos,
  getApprovedVideos,
  getWorkerVideoById,
  getMyVideos,
  updateWorkerVideo,
  deleteWorkerVideo
} from '../controllers/workerVideo.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { requireApprovedVideo, requireApprovalPermission } from '../middlewares/videoApproval.middleware.js';

const router = Router();

// Worker routes - any authenticated user can upload
router.post('/upload', verifyJWT, upload.single('file'), uploadWorkerVideo);
router.get('/my-videos', verifyJWT, getMyVideos);

// Public routes - approved videos only
router.get('/approved', verifyJWT, getApprovedVideos);

// Admin routes - review and manage videos
router.get('/pending', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), getPendingVideos);
router.get('/all', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), getAllWorkerVideos);
router.post('/:id/approve', verifyJWT, requireApprovalPermission, approveVideo);
router.post('/:id/reject', verifyJWT, requireApprovalPermission, rejectVideo);

// Video management
router.get('/:id', verifyJWT, requireApprovedVideo, getWorkerVideoById);
router.put('/:id', verifyJWT, updateWorkerVideo);
router.delete('/:id', verifyJWT, deleteWorkerVideo);

export default router;
