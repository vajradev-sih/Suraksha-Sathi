import { Router } from 'express';
import { createOrUpdateSalary, getSalaryRecordsForUser } from '../controllers/payroll.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

// Only Admin and HR role can access payroll data
router.post('/', verifyJWT, authorizeRoles('Admin', 'HR'), createOrUpdateSalary);
router.get('/user/:user_id', verifyJWT, authorizeRoles('Admin', 'HR'), getSalaryRecordsForUser);

export default router;
