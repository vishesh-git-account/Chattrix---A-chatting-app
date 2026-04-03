const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const Message = require("./models/Message");
const User = require("./models/User"); // 🔥 IMPORTANT

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const messageRoutes = require("./routes/messages");
app.use("/api/messages", messageRoutes);

// userId → socketId map
const users = {};

// 🔌 SOCKET CONNECTION
io.on("connection", async (socket) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log("No token");
      return;
    }

    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    users[userId] = socket.id;

    console.log("User connected:", userId);

    // 🔥 SEND ONLINE USERS WITH USERNAMES
    const onlineUsers = await User.find({
      _id: { $in: Object.keys(users) },
    }).select("_id username");

    io.emit("online_users", onlineUsers);

    // 💬 SEND MESSAGE
    socket.on("send_message", async ({ toUserId, message }) => {
      const newMessage = new Message({
        sender: userId,
        receiver: toUserId,
        message,
        timestamp: new Date(),
      });

      await newMessage.save();

      const payload = {
        sender: userId,
        receiver: toUserId,
        message,
        timestamp: newMessage.timestamp,
      };

      const targetSocket = users[toUserId];

      if (targetSocket) {
        io.to(targetSocket).emit("receive_message", payload);
      }

      socket.emit("receive_message", payload);
    });

    // ✍️ TYPING
    socket.on("typing", ({ toUserId }) => {
      const targetSocket = users[toUserId];

      if (targetSocket) {
        io.to(targetSocket).emit("typing", {
          from: userId,
        });
      }
    });

    // ❌ DISCONNECT
    socket.on("disconnect", async () => {
      delete users[userId];
      console.log("User disconnected:", userId);

      const onlineUsers = await User.find({
        _id: { $in: Object.keys(users) },
      }).select("_id username");

      io.emit("online_users", onlineUsers);
    });

  } catch (err) {
    console.log("Invalid token");
  }
});

// DB
mongoose.connect("mongodb://127.0.0.1:27017/chatapp")
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

// start
server.listen(5000, () => {
  console.log("Server running on port 5000");
});