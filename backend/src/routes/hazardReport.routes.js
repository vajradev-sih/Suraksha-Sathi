import { Router } from 'express';
import {
  createHazardReport,
  getAllHazardReports,
  getHazardReportById,
  updateHazardReport,
  deleteHazardReport
} from '../controllers/hazardReport.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

// Workers and higher roles can create reports
router.post('/', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager', 'Worker'), createHazardReport);

// Only Admin, TrainingOfficer, Manager can view all reports
router.get('/', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager'), getAllHazardReports);

// Individual report access: workers and above
router.get('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager', 'Worker'), getHazardReportById);

router.put('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager'), updateHazardReport);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), deleteHazardReport);

export default router;
