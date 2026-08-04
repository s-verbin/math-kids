import express from 'express';
import { getProfile, updateAvatar } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/avatar', authMiddleware, updateAvatar);

export default router;
