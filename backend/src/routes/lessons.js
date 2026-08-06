import express from 'express';
import { startLesson, submitLesson, getLeaderboard, getAchievements } from '../controllers/lessonController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', startLesson);
router.post('/submit', authMiddleware, submitLesson);
router.get('/leaderboard', authMiddleware, getLeaderboard);
router.get('/achievements', authMiddleware, getAchievements);

export default router;
