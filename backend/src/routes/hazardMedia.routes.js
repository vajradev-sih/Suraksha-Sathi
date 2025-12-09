import { Router } from 'express';
import {
  uploadHazardMedia,
  getAllHazardMedia,
  getHazardMediaById,
  getHazardMediaByReportId,
  updateHazardMedia,
  deleteHazardMedia
} from '../controllers/hazardMedia.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

router.post('/upload', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Worker'), upload.single('file'), uploadHazardMedia);
router.get('/', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getAllHazardMedia);
router.get('/report/:reportId', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Worker'), getHazardMediaByReportId);
router.get('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Worker'), getHazardMediaById);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), updateHazardMedia);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), deleteHazardMedia);

export default router;
