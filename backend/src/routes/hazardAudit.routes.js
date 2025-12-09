import { Router } from 'express';
import {
  createHazardAudit,
  getAuditsByReport,
  updateHazardAudit,
  deleteHazardAudit
} from '../controllers/hazardAudit.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

router.post('/', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), createHazardAudit);
router.get('/report/:report_id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), getAuditsByReport);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), updateHazardAudit);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'TrainingOfficer'), deleteHazardAudit);

export default router;
