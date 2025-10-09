import { Router } from 'express';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
} from '../controllers/role.controller.js'; // assuming exists

import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('Admin'));

router.post('/', createRole);
router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
