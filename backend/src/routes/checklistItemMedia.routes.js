import { Router } from 'express';
import {
  uploadChecklistItemMedia,
  getAllChecklistItemMedia,
  getChecklistItemMediaById,
  updateChecklistItemMedia,
  deleteChecklistItemMedia
} from '../controllers/checklistItemMedia.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`[CHECKLIST-MEDIA ROUTE] ${req.method} ${req.originalUrl}`);
  console.log('[CHECKLIST-MEDIA ROUTE] Content-Type:', req.get('content-type'));
  next();
});

// Upload media - workers upload completion proof, admins/managers upload equipment reference images
router.post('/upload', 
  verifyJWT, 
  upload.single('media'), // Changed from 'file' to 'media' for clarity
  uploadChecklistItemMedia
);

// Get all media with optional filters
router.get('/', verifyJWT, getAllChecklistItemMedia);

// Get single media by ID
router.get('/:id', verifyJWT, getChecklistItemMediaById);

// Update media metadata (admin only)
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), updateChecklistItemMedia);

// Delete media (admin only)
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), deleteChecklistItemMedia);

export default router;
