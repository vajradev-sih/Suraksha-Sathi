import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

router.post('/', verifyJWT, authorizeRoles('Admin'), createUser);
router.get('/', verifyJWT, authorizeRoles('Admin', 'Manager'), getAllUsers);
router.get('/:id', verifyJWT, authorizeRoles('Admin', 'Manager'), getUserById);
router.put('/:id', verifyJWT, authorizeRoles('Admin', 'Manager'), updateUser);
router.delete('/:id', verifyJWT, authorizeRoles('Admin'), deleteUser);

export default router;