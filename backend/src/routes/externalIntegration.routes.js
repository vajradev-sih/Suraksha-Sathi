import { Router } from 'express';
import {
  createExternalIntegration,
  getAllExternalIntegrations,
  updateExternalIntegration,
  deleteExternalIntegration
} from '../controllers/externalIntegration.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, createExternalIntegration);
router.get('/', verifyJWT, getAllExternalIntegrations);
router.put('/:id', verifyJWT, updateExternalIntegration);
router.delete('/:id', verifyJWT, deleteExternalIntegration);

export default router;
