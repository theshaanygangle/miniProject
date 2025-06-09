const mongoose = require("mongoose");

// Subdocument schema for individual messages
const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } // prevents creation of _id for each message subdoc
);

// Chat document schema
const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema], // array of messages
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
