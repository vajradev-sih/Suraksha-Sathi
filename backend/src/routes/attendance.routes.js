import { Router } from 'express';
import { clockIn, clockOut, getAttendanceForUser } from '../controllers/attendance.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Accessible to all authenticated users
router.post('/check-in', verifyJWT, clockIn);
router.post('/check-out', verifyJWT, clockOut);
router.get('/user/:user_id', verifyJWT, getAttendanceForUser);

export default router;
