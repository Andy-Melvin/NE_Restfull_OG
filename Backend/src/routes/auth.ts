import express from 'express';
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from '../controllers/auth';

import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../schema/auth.schema';

const router = express.Router();

/* ========== PUBLIC AUTH ROUTES ========== */
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/* ========== PROTECTED AUTH ROUTES ========== */
// Get current user info
router.get('/me', authenticate, getCurrentUser);
// Logout requires authentication
router.post('/logout', authenticate, logout);

/* ========== ADMIN ONLY ROUTES ========== */
// Add admin-specific routes here with both authentication and authorization
// Example:
// router.get('/admin/users', authenticate, authorize(['admin']), adminController.getAllUsers);

export default router;
