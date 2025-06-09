const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const { sendMessage } = require("./middleware/chat");
const activeUsers = new Map();

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", async (data) => {
      const { userId, userType } = data;

      const tempUser = await userModel.findByIdAndUpdate(userId, {
        socketId: socket.id,
      });

      console.log(`User ${userId} joined as ${socket.id}`);
    });

    socket.on("send_message", async (data) => {
      const { senderId, receiverId, text } = data;
      const chat = await sendMessage({ senderId, receiverId, text }); // Call your sendMessage function here

      // 1. Get receiver's socket id from MongoDB
      const user = await userModel.findById(receiverId); // or however you store it

      if (user && user.socketId) {
        // 2. Emit to the receiver's socket only
        io.to(user.socketId).emit("receive_message", data);
      } else {
        console.log("Receiver not connected");
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected : ${socket.id}`);
    });
  });
}
function sendMessageToSocketId(socketId, messageObj) {
  if (io) {
    io.to(socketId).emit(messageObj.event, messageObj.data);
  } else {
    console.log("Socket.io not initialized.");
  }
}
module.exports = { initializeSocket, sendMessageToSocketId };
