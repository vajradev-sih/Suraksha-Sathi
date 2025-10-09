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
  updateChecklistItem, deleteChecklistItem
} from '../controllers/checklistItem.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, createChecklistItem);
router.get('/', verifyJWT, getItemsForChecklist);
router.get('/:id', verifyJWT, getChecklistItemById);
router.put('/:id', verifyJWT, updateChecklistItem);
router.delete('/:id', verifyJWT, deleteChecklistItem);

export default router;
