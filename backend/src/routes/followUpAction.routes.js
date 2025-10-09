import { Router } from 'express';
import {
  createFollowUpAction,
  getFollowUpsByReport,
  updateFollowUpAction,
  deleteFollowUpAction
} from '../controllers/followUpAction.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

router.post('/', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), createFollowUpAction);
router.get('/report/:report_id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager', 'Worker'), getFollowUpsByReport);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), updateFollowUpAction);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'SafetyOfficer', 'Manager'), deleteFollowUpAction);

export default router;
