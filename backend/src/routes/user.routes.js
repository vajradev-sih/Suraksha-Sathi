import { Router } from 'express';
import {
  // Authentication & Self-Management Functions
  registerUser,
  loginUser,
  logoutUser,
  refreshAccesToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccoundDetails,
  // Admin/Manager CRUD Functions
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js'; // Imports all necessary functions

import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

// ============================================
// 1. PUBLIC AUTHENTICATION ROUTES (No JWT required)
// ============================================

// Worker registration (initial sign-up)
router.post('/register', registerUser);

// User login
router.post('/login', loginUser);

// Get a new access token using the refresh token
router.post('/refresh-token', refreshAccesToken);


// ============================================
// 2. PROTECTED ROUTES (JWT required for all below)
// ============================================
router.use(verifyJWT);

// SELF-MANAGEMENT ROUTES (Basic Auth)
router.post('/logout', logoutUser);
router.put('/change-password', changeCurrentPassword);
router.get('/current-user', getCurrentUser);
router.put('/update-details', updateAccoundDetails); // Update name, email, phone etc.


// ADMIN / MANAGER USER CRUD ROUTES (Requires Authorization)
// Route: POST /api/v1/user/
// Note: This is typically for an Admin creating a user and assigning a role
router.post('/', authorizeRoles('Admin'), createUser);

// Route: GET /api/v1/user/
router.get('/', authorizeRoles('Admin', 'Manager'), getAllUsers);

// Route: GET /api/v1/user/:id
router.get('/:id', authorizeRoles('Admin', 'Manager'), getUserById);

// Route: PUT /api/v1/user/:id
router.put('/:id', authorizeRoles('Admin', 'Manager'), updateUser);

// Route: DELETE /api/v1/user/:id
router.delete('/:id', authorizeRoles('Admin'), deleteUser);


export default router;