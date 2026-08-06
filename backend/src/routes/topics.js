import express from 'express';
import { getTopics, getTopic } from '../controllers/topicController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTopics);
router.get('/:id', getTopic);

export default router;
