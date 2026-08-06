import express from 'express';
import { getTopics, getTopic } from '../controllers/topicController.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuthMiddleware, getTopics);
router.get('/:id', optionalAuthMiddleware, getTopic);

export default router;
