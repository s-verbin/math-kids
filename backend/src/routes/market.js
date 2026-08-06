import express from 'express';
import { getMarketPrices, sellResource } from '../controllers/marketController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/prices', getMarketPrices);
router.post('/sell', authMiddleware, sellResource);

export default router;
