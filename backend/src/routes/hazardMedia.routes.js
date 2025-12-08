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

router.post('/upload', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Worker'), upload.single('file'), uploadHazardMedia);
router.get('/', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), getAllHazardMedia);
router.get('/report/:reportId', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Worker'), getHazardMediaByReportId);
router.get('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Worker'), getHazardMediaById);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), updateHazardMedia);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), deleteHazardMedia);

export default router;
