import Chat from "../models/chats.model.js"; // path to your Chat model

export const sendMessage = async ({ senderId, receiverId, text }) => {
  try {
    // First, try to find existing chat between users (both directions)
    let chat = await Chat.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    const newMessage = {
      text,
      senderId,
      timestamp: new Date(),
      seen: false,
    };

    if (chat) {
      // Chat exists, push new message
      chat.messages.push(newMessage);
      await chat.save();
      console.log("Message added to existing chat");
    } else {
      // No chat exists, create a new one
      chat = new Chat({
        senderId,
        receiverId,
        messages: [newMessage],
      });
      await chat.save();
      console.log("New chat created with message");
    }

    return chat;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
