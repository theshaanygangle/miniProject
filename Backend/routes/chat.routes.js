const express = require("express");
const router = express.Router();
const Chat = require("../models/chats.model");
const getPartnerChats = require("../controller/chats.controller");
const userModel = require("../models/user.model");

// Send a message
router.post("/send", async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  try {
    let chat = await Chat.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (!chat) {
      chat = new Chat({ senderId, receiverId, messages: [] });
    }

    chat.messages.push({ text, senderId });
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
});

// Get chat between two users
router.get("/conversation", async (req, res) => {
  const { user1, user2 } = req.query;

  try {
    const chat = await Chat.findOne({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).populate("senderId receiverId", "fullname email");

    if (!chat)
      return res.status(404).json({ message: "No conversation found." });

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Failed to get conversation." });
  }
});

router.get("/chat-partners/:userId", async (req, res) => {
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
    const partners = await userModel
      .find({
        _id: { $in: Array.from(partnerIds) },
      })
      .select("fullname username email role specialization");

    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching chat partners:", error);
    res.status(500).json({ error: "Failed to fetch chat partners" });
  }
});

router.get("/messages", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Sender and Receiver IDs are required" });
    }

    const messages = await Chat.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 }); // sort by time ascending

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
