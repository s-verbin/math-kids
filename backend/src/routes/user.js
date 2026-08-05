import express from 'express';
import { getProfile, updateAvatar, updateLeaderboardVisibility } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/avatar', authMiddleware, updateAvatar);
router.put('/leaderboard-visibility', authMiddleware, updateLeaderboardVisibility);

export default router;
