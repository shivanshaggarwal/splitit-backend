import express from 'express';
import { protect } from '../middelwares/authMiddelwares.js';
import {
  addExpense,
  getGroupExpenses,
  getFriendExpenses,
  fetchAllExpenses
} from '../controllers/expenseController.js';

const router = express.Router(); 

router.post('/add', protect, addExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.get('/friend/:friendId', protect, getFriendExpenses);
router.get('/fetchAllExpenses', protect, fetchAllExpenses);

export default router;
