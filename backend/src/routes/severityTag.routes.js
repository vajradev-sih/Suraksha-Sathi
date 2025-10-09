import { Router } from 'express';
import {
  createSeverityTag,
  getAllSeverityTags,
  getSeverityTagById,
  updateSeverityTag,
  deleteSeverityTag
} from '../controllers/severityTag.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, createSeverityTag);
router.get('/', verifyJWT, getAllSeverityTags);
router.get('/:id', verifyJWT, getSeverityTagById);
router.put('/:id', verifyJWT, updateSeverityTag);
router.delete('/:id', verifyJWT, deleteSeverityTag);

export default router;
