import { Router } from 'express';
import {
  assignTaskToUser, getUserAssignments, updateAssignment, deleteAssignment
} from '../controllers/userTaskAssignment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, assignTaskToUser);
router.get('/:user_id', verifyJWT, getUserAssignments);
router.put('/:id', verifyJWT, updateAssignment);
router.delete('/:id', verifyJWT, deleteAssignment);

export default router;
