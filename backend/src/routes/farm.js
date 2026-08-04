import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  getShop, 
  getUserFarm, 
  buyAnimal, 
  buyItem, 
  feedAnimal, 
  petAnimal,
  equipItem 
} from '../controllers/farmController.js';

const router = express.Router();

router.get('/shop', auth, getShop);
router.get('/my-farm', auth, getUserFarm);
router.post('/buy-animal', auth, buyAnimal);
router.post('/buy-item', auth, buyItem);
router.post('/feed', auth, feedAnimal);
router.post('/pet', auth, petAnimal);
router.post('/equip', auth, equipItem);

export default router;
