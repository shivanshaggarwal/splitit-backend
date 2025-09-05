import { ExpenseModel } from "../models/expenseModels.js";
import { GroupModel } from "../models/groupModel.js";

export const addExpense = async (req, res) => {
  const { description, amount, splitBetween, groupId, paidBy } = req.body;

  try {
    if (
      !description ||
      !amount ||
      !splitBetween ||
      (splitBetween.length === 0 && !groupId) ||
      !paidBy
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }
    if (!splitBetween.includes(paidBy) && !groupId) {
      return res
        .status(400)
        .json({ msg: "Payer must be one of the participants" });
    }
    if (groupId) {
      const group = await GroupModel.findById(groupId);
      if (!group || !group.members.includes(req.user.id)) {
        return res
          .status(403)
          .json({ msg: "Invalid group or permission denied" });
      }

      group.members.map((g)=>{
        splitBetween.push(g._id);
      })
    }

    const expense = await ExpenseModel.create({
      description,
      amount,
      paidBy,
      splitBetween,
      group: groupId || null,
    });
    res.status(201).json({ msg: "Expense added", expense });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getGroupExpenses = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await ExpenseModel.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email");

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const getFriendExpenses = async(req,res)=>{
    const {friendId} = req.params;

    try{
        const expenses = await ExpenseModel.find({
            group: null,
            $or:[
                {paidBy:req.user.id, splitBetween: { $in: [friendId]}},
                {paidBy:friendId, splitBetween: {$in: [req.user.id]}}
            ]
        }).populate('paidBy','name email').populate('splitBetween', 'name email')
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }

}

export const fetchAllExpenses = async (req,res) =>{
  const userId = req.user.id;

  try{
    const expenses = await ExpenseModel.find({
      $or:
      [
        {paidBy:userId},
        {splitBetween: {$in:[userId]}}
      ]
    }).populate('paidBy', 'name email').populate('splitBetween', 'name email');
    return res.json(expenses);
  }catch(error){
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}