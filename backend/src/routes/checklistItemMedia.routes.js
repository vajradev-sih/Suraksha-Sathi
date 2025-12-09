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
  (req, res, next) => {
    console.log('[CHECKLIST-MEDIA] Before multer');
    next();
  },
  upload.any(), // Accept any field name for flexibility
  (req, res, next) => {
    console.log('[CHECKLIST-MEDIA] After multer');
    console.log('[CHECKLIST-MEDIA] Files received:', req.files?.length || 0);
    console.log('[CHECKLIST-MEDIA] Field names:', req.files?.map(f => f.fieldname).join(', '));
    
    // Normalize to req.file regardless of field name
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
      console.log('[CHECKLIST-MEDIA] File normalized from field:', req.file.fieldname);
    } else {
      console.log('[CHECKLIST-MEDIA] WARNING: No files received');
    }
    
    next();
  },
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
