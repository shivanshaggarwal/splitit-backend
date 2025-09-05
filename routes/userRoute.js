import express from 'express';
import { protect } from '../middelwares/authMiddelwares.js';
import { getMe, searchUsers } from '../controllers/userController.js';

const router = express.Router();


router.get('/me', protect, getMe);
router.get('/searchUsers',protect,searchUsers);

export default router;

