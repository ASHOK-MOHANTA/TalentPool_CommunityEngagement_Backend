const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db"); // MongoDB connection
const routes = require("./routes/index");
const Message = require("./models/Message"); // Message model

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", routes);

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // restrict this to frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Attach io to req for controllers that need to emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // ✅ Join project room
  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`✅ Socket ${socket.id} joined project ${projectId}`);
  });

  // ✅ Leave project room
  socket.on("leaveProject", (projectId) => {
    socket.leave(projectId);
    console.log(`👋 Socket ${socket.id} left project ${projectId}`);
  });

  // ✅ Handle real-time sendMessage (alternative to REST POST)
  socket.on("sendMessage", async ({ projectId, user, message }) => {
    try {
      if (!projectId || !user?._id || !message?.trim()) {
        return;
      }

      // Save message in MongoDB
      let newMessage = await Message.create({
        project: projectId,
        user: user._id,
        text: message,
      });

      // Populate user details
      newMessage = await newMessage.populate("user", "name email");

      // Broadcast to all users in project room
      io.to(projectId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
