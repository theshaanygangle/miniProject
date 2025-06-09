const express = require("express");
const router = express.Router();
const Chat = require("../models/chats.model.js"); // your chat model
const User = require("../models/user.model.js"); // your user model

// Fetch chat partners of a user
module.exports.getPartnerChats = async (req, res) => {
  const { userId } = req.params;
  console.log("getPartnerChats called with userId:", userId);

  try {
    // Step 1: Find all chats involving this user
    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    // Step 2: Extract unique partner IDs
    const partnerIds = new Set();

    chats.forEach((chat) => {
      if (chat.senderId.toString() !== userId) {
        partnerIds.add(chat.senderId.toString());
      }
      if (chat.receiverId.toString() !== userId) {
        partnerIds.add(chat.receiverId.toString());
      }
    });

    // Step 3: Fetch partner user details
    const partners = await User.find({
      _id: { $in: Array.from(partnerIds) },
    }).select("fullname username email role specialization");

    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching chat partners:", error);
    res.status(500).json({ error: "Failed to fetch chat partners" });
  }
};

module.exports = router;
