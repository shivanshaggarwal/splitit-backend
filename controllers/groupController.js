import { GroupModel } from "../models/groupModel.js";
import { UserModel } from "../models/userModel.js";


export const createGroup= async (req,res)=>{
    const {name,memberEmails} = req.body;
    const creatorId = req.user.id;

    try{
        const members = await UserModel.find({email:{$in: memberEmails}});
        if(members.length != memberEmails.length){
             return res.status(400).json({ msg: 'One or more members not found' });
        }

        const group = await GroupModel.create({
            createdBy: creatorId,
            members: [...members.map(u=>u._id),creatorId],
            name
        })

        const currentGroup = await GroupModel.findById(group._id).populate('members','name email');
    res.status(201).json(currentGroup);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

export const getUserGroups = async (req, res) => {
  try {
    const groups = await GroupModel.find({ members: req.user.id }).populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await GroupModel.findById(groupId).populate('members', 'name email');

    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (!group.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ msg: 'Not a member of this group' });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


export const addGroupMember = async (req, res) => {
  const { email } = req.body;
  const {groupId} = req.params;
  console.log(59 ,groupId);

  try {
    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    // Only allow if user is already a member
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'You are not a member of this group' });
    }

    const userToAdd = await UserModel.findOne({ email });
    if (!userToAdd) return res.status(404).json({ msg: 'User not found' });

    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ msg: 'User is already a member of this group' });
    }

    group.members.push(userToAdd._id);
    await group.save();
    const updatedGroup = await GroupModel.findById(group._id).populate('members', 'name email');
    console.log(updatedGroup);
    res.json({ msg: 'Member added successfully', updatedGroup });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
export const removeGroupMember = async (req, res) => {

  const { email,groupId } = req.body;

  try {
    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    // Only allow if user is a member
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'You are not a member of this group' });
    }

    const userToRemove = await UserModel.findOne({ email });
    if (!userToRemove) return res.status(404).json({ msg: 'User not found' });

    // Prevent removing the creator
    if (userToRemove._id.toString() === group.createdBy.toString()) {
      return res.status(403).json({ msg: 'Cannot remove group creator' });
    }

    // If not in group
    if (!group.members.includes(userToRemove._id)) {
      return res.status(400).json({ msg: 'User is not a member of this group' });
    }

    group.members = group.members.filter(
      memberId => memberId.toString() !== userToRemove._id.toString()
    );

    await group.save();

    const updatedGroup = await GroupModel.findById(group._id).populate('members', 'name email');
    console.log(updatedGroup);
    res.json({ msg: 'Member removed successfully', updatedGroup });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
