import express from 'express';
import { protect } from '../middelwares/authMiddelwares.js';
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addGroupMember,
  removeGroupMember
} from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', protect, createGroup);
router.get('/', protect, getUserGroups);
router.get('/:groupId', protect, getGroupDetails);
router.put('/:groupId/add-member', protect, addGroupMember);
router.put('/:groupId/remove-member', protect, removeGroupMember);
export default router;
