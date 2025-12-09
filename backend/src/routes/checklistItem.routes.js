/**
 * ============================================
 * CHECKLIST ITEM ROUTES
 * ============================================
 * RESTful endpoints for checklist item CRUD.
 * All routes use verifyJWT for authentication.
 */
import { Router } from 'express';
import {
  createChecklistItem, getItemsForChecklist, getChecklistItemById,
  updateChecklistItem, deleteChecklistItem,
  createChecklistItemWithImage, updateChecklistItemWithImage
} from '../controllers/checklistItem.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// Create checklist item with equipment image (Admin, SafetyOfficer, Manager only)
router.post('/with-image', 
  verifyJWT, 
  authorizeRoles('Admin', 'SafetyOfficer', 'Manager'),
  upload.single('equipment_image'),
  createChecklistItemWithImage
);

// Create checklist item (Admin, SafetyOfficer, Manager only)
router.post('/', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), createChecklistItem);

// Get items for a checklist (all authenticated users)
router.get('/', verifyJWT, getItemsForChecklist);

// Get single item by ID (all authenticated users)
router.get('/:id', verifyJWT, getChecklistItemById);

// Update checklist item with new equipment image (Admin, SafetyOfficer, Manager only)
router.put('/:id/with-image',
  verifyJWT,
  authorizeRoles('Admin', 'SafetyOfficer', 'Manager'),
  upload.single('equipment_image'),
  updateChecklistItemWithImage
);

// Update checklist item (Admin, SafetyOfficer, Manager only)
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), updateChecklistItem);

// Delete checklist item (Admin, SafetyOfficer only)
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), deleteChecklistItem);

export default router;
