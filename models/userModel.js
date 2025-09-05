import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}], //incoming requests
  sentRequests: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}] //incoming requests
});

export const UserModel = mongoose.model('User',userSchema);