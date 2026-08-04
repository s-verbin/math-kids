import express from 'express';
import { getTopics, getTopic } from '../controllers/topicController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getTopics);
router.get('/:id', authMiddleware, getTopic);

export default router;
