/**
 * ============================================
 * TASK ROUTES
 * ============================================
 * 
 * Defines RESTful routes for Task CRUD.
 * All routes use verifyJWT for authentication.
 */

import { Router } from 'express';
import {
  createTask, getAllTasks, getTaskById,
  updateTask, deleteTask
} from '../controllers/task.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// CRUD routes for Task
router.post('/', verifyJWT, createTask);
router.get('/', verifyJWT, getAllTasks);
router.get('/:id', verifyJWT, getTaskById);
router.put('/:id', verifyJWT, updateTask);
router.delete('/:id', verifyJWT, deleteTask);

export default router;
