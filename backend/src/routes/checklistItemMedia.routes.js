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

const router = Router();

router.post('/upload', verifyJWT, upload.single('file'), uploadChecklistItemMedia);
router.get('/', verifyJWT, getAllChecklistItemMedia);
router.get('/:id', verifyJWT, getChecklistItemMediaById);
router.put('/:id', verifyJWT, updateChecklistItemMedia);
router.delete('/:id', verifyJWT, deleteChecklistItemMedia);

export default router;
