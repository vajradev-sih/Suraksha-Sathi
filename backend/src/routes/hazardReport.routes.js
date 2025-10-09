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
router.post('/', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager', 'Worker'), createHazardReport);

// Only Admin, SafetyOfficer, Manager can view all reports
router.get('/', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), getAllHazardReports);

// Individual report access: workers and above
router.get('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager', 'Worker'), getHazardReportById);

router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), updateHazardReport);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), deleteHazardReport);

export default router;
