import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refreshToken);

// Protected routes (require valid access token)
router.post('/logout', verifyToken, logout);
router.get('/profile', verifyToken, getProfile);
router.post('/change-password', verifyToken, changePassword);

export default router;