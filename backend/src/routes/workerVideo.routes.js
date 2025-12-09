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
  deleteWorkerVideo,
  getAutoRejectedVideos,
  getFlaggedVideos,
  getModerationStats
} from '../controllers/workerVideo.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { requireApprovedVideo, requireApprovalPermission } from '../middlewares/videoApproval.middleware.js';
import { moderateUploadedContent } from '../middlewares/contentModeration.middleware.js';

const router = Router();

// Add logging middleware to trace all requests to this router
router.use((req, res, next) => {
  console.log(`[WORKER-VIDEO ROUTE] ${req.method} ${req.originalUrl}`);
  console.log('[WORKER-VIDEO ROUTE] Content-Type:', req.get('content-type'));
  next();
});

// Worker routes - any authenticated user can upload
router.post('/upload', 
  (req, res, next) => {
    console.log('[UPLOAD ROUTE] Step 1: Before verifyJWT');
    next();
  },
  verifyJWT,
  (req, res, next) => {
    console.log('[UPLOAD ROUTE] Step 2: After verifyJWT, before multer');
    console.log('[UPLOAD ROUTE] User authenticated:', req.user?._id);
    next();
  },
  upload.any(), // Simplified - use multer directly
  (req, res, next) => {
    console.log('[UPLOAD ROUTE] Step 3: Multer complete');
    console.log('[UPLOAD ROUTE] Files received:', req.files?.length || 0);
    
    // Normalize to req.file
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
      console.log('[UPLOAD ROUTE] File normalized:', req.file.fieldname);
    } else {
      console.log('[UPLOAD ROUTE] WARNING: No files received');
    }
    
    next();
  },
  (req, res, next) => {
    console.log('[UPLOAD ROUTE] Step 4: Content moderation check');
    next();
  },
  moderateUploadedContent, // ✅ CONTENT FILTER - Blocks explicit content before database
  (req, res, next) => {
    console.log('[UPLOAD ROUTE] Step 5: Moderation passed, calling controller');
    next();
  },
  uploadWorkerVideo
);
router.get('/my-videos', verifyJWT, getMyVideos);

// Public routes - approved videos only
router.get('/approved', verifyJWT, getApprovedVideos);

// Admin routes - review and manage videos
router.get('/pending', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getPendingVideos);
router.get('/all', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getAllWorkerVideos);
router.post('/:id/approve', verifyJWT, requireApprovalPermission, approveVideo);
router.post('/:id/reject', verifyJWT, requireApprovalPermission, rejectVideo);

// Moderation routes (admin only)
router.get('/moderation/auto-rejected', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getAutoRejectedVideos);
router.get('/moderation/flagged', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getFlaggedVideos);
router.get('/moderation/stats', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getModerationStats);

// Video management
router.get('/:id', verifyJWT, requireApprovedVideo, getWorkerVideoById);
router.put('/:id', verifyJWT, updateWorkerVideo);
router.delete('/:id', verifyJWT, deleteWorkerVideo);

export default router;
