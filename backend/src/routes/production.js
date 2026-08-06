import express from 'express';
import { getProductionStatus, collectResource, getResources } from '../controllers/productionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', authMiddleware, getProductionStatus);
router.post('/collect', authMiddleware, collectResource);
router.get('/resources', authMiddleware, getResources);

export default router;
