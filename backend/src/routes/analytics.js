import express from 'express';
import { startSession, endSession, getStats } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', authMiddleware, startSession);
router.post('/end', authMiddleware, endSession);
router.get('/stats', authMiddleware, getStats);

export default router;
