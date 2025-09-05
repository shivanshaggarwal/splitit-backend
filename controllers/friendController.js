import { request } from "express";
import { UserModel } from "../models/userModel.js";

export const sendRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  const fromUserId = req.user.id;

  const toUser = await UserModel.findOne({ email });

  if (!toUser) return res.status(404).json({ msg: "User not found" });

  if (toUser._id.toString() === fromUserId) {
    return res
      .status(400)
      .json({ msg: "Can't send friend request to yourself" });
  }

  const fromUser = await UserModel.findById(fromUserId);

  if (toUser.friendRequests.includes(fromUser._id)) {
    return res.status(400).json({ msg: "Friend request already sent" });
  }

  toUser.friendRequests.push(fromUser._id);
  fromUser.sentRequests.push(toUser._id);

  await Promise.all([fromUser.save(), toUser.save()]);
  res.json({ msg: "Friend request sent" });
};

export const acceptRequest = async (req, res) => {
  const { requesterId } = req.body;

  try {
    const currentUser = await UserModel.findById(req.user.id);
    const requester = await UserModel.findById(requesterId);

    if (!requester) return res.status(404).json({ msg: "Requester not found" });

    currentUser.friendRequests = currentUser.friendRequests.filter(
      (userId) => userId.toString() !== requester._id.toString()
    );

    currentUser.friends.push(requester._id);
    requester.friends.push(currentUser._id);

    const user =  await currentUser.save();
    await requester.save();

    res.json({ msg: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


export const getFriends = async (req, res) => {
  const user = await UserModel.findById(req.user.id).populate(
    "friends",
    "name email"
  );
  return res.json(user.friends);
};

// Get incoming friend requests
export const getRequests = async (req, res) => {
  const user = await UserModel.findById(req.user.id).populate(
    "friendRequests",
    "name email"
  );
  res.json(user.friendRequests);
};

// Reject incoming friend requests
export const rejectFriendRequest = async (req, res) => {
  try{
    const { requesterId } = req.body;
    const [currentUser, requester] = await Promise.all([
      UserModel.findById(req.user.id),
      UserModel.findById(requesterId),
    ]);
  
    if (!currentUser || !requester) {
      return res.status(404).json({ msg: "User not found" });
    }
  
    currentUser.friendRequests = currentUser.friendRequests.filter((id)=> id.toString() !== requesterId);
    await currentUser.save();
    res.status(200).json({msg:'Friend request rejected'});
  }catch(error){
    res.status(500).json({ msg: 'Server error' });
  }
};


export const unfriendRequest = async(req,res)=>{
  try {
    const { unfriendId } = req.body;
    const [currentUser, unfriend] = await Promise.all([
      UserModel.findById(req.user.id),
      UserModel.findById(unfriendId),
    ]);

    if (!currentUser || !unfriend) {
      return res.status(404).json({ msg: "User not found" });
    }

    currentUser.friends = currentUser.friends.filter((id)=>id.toString() !== unfriendId) 
    unfriend.friends = unfriend.friends.filter((id)=>id.toString() !== req.user.id) ;
    await Promise.all([
      currentUser.save(),
      unfriend.save(),
    ]);
    return res.status(200).json({ msg: "Unfriended successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "Server error" });
  }
}