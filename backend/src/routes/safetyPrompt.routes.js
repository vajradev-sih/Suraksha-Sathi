import { Router } from 'express';
import {
  schedulePrompt, getUserPrompts, updatePromptStatus
} from '../controllers/safetyPrompt.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, schedulePrompt);
router.get('/:user_id', verifyJWT, getUserPrompts);
router.put('/:id/status', verifyJWT, updatePromptStatus);

export default router;
