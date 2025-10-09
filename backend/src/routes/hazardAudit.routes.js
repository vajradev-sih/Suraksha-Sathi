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

router.post('/', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), createHazardAudit);
router.get('/report/:report_id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), getAuditsByReport);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), updateHazardAudit);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer'), deleteHazardAudit);

export default router;
