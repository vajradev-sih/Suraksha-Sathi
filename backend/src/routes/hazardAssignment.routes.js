import { Router } from 'express';
import {
  createHazardAssignment,
  getAssignmentsByReport,
  updateHazardAssignment,
  deleteHazardAssignment
} from '../controllers/hazardAssignment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

router.post('/', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager'), createHazardAssignment);
router.get('/report/:report_id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager'), getAssignmentsByReport);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager'), updateHazardAssignment);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer', 'Manager'), deleteHazardAssignment);

export default router;
