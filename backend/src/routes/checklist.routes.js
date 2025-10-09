/**
 * ============================================
 * CHECKLIST ROUTES
 * ============================================
 * 
 * RESTful routes for Checklist CRUD and query.
 * All routes use verifyJWT for authentication.
 */
import { Router } from 'express';
import {
  createChecklist, getAllChecklists, getChecklistById,
  updateChecklist, deleteChecklist
} from '../controllers/checklist.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, createChecklist);
router.get('/', verifyJWT, getAllChecklists);
router.get('/:id', verifyJWT, getChecklistById);
router.put('/:id', verifyJWT, updateChecklist);
router.delete('/:id', verifyJWT, deleteChecklist);

export default router;
