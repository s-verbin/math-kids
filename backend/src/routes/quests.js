import express from 'express';
import { getDailyQuests, updateQuestProgress, claimQuestReward } from '../controllers/questsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/daily', authMiddleware, getDailyQuests);
router.post('/progress', authMiddleware, updateQuestProgress);
router.post('/claim', authMiddleware, claimQuestReward);

export default router;
