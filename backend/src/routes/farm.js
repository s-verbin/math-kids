import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
  getShop, 
  getUserFarm, 
  buyAnimal, 
  buyItem, 
  feedAnimal, 
  petAnimal,
  equipItem,
  sellAnimal,
  sellItem
} from '../controllers/farmController.js';

const router = express.Router();

router.get('/shop', authMiddleware, getShop);
router.get('/my-farm', authMiddleware, getUserFarm);
router.post('/buy-animal', authMiddleware, buyAnimal);
router.post('/buy-item', authMiddleware, buyItem);
router.post('/feed', authMiddleware, feedAnimal);
router.post('/pet', authMiddleware, petAnimal);
router.post('/equip', authMiddleware, equipItem);
router.post('/sell-animal', authMiddleware, sellAnimal);
router.post('/sell-item', authMiddleware, sellItem);

export default router;
