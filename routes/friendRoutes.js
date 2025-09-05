import express from 'express';
import { getFriends, acceptRequest,getRequests,sendRequest, rejectFriendRequest,unfriendRequest } from "../controllers/friendController.js";
import { protect } from '../middelwares/authMiddelwares.js';

const router = express.Router();

router.post('/send', protect, sendRequest);
router.post('/accept', protect, acceptRequest);
router.get('/list', protect, getFriends);
router.get('/requests', protect, getRequests);
router.post('/reject', protect, rejectFriendRequest);
router.post('/unfriend', protect, unfriendRequest);

export default router;