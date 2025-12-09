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

router.post('/', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), createEscalation);
router.get('/report/:report_id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getEscalationsByReport);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), updateEscalation);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), deleteEscalation);

export default router;
