import { Router } from 'express';
import {
  createEscalation,
  getEscalationsByReport,
  updateEscalation,
  deleteEscalation
} from '../controllers/escalation.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

router.post('/', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), createEscalation);
router.get('/report/:report_id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), getEscalationsByReport);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), updateEscalation);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), deleteEscalation);

export default router;
