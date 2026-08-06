import express from 'express';
import { getRecipes, craftItem } from '../controllers/craftingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/recipes', authMiddleware, getRecipes);
router.post('/craft', authMiddleware, craftItem);

export default router;
