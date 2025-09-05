import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export const GroupModel = mongoose.model("Group", groupSchema);
