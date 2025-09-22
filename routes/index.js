// backend/routes/index.js
const express = require("express");
const router = express.Router();

// Import sub-routers
const authRoutes = require("./authRoutes");
const projectRoutes = require("./projectRoutes");
const profileRoutes = require("./profileRoutes");
const messageRoutes = require("./messageRoutes");

// Routes
router.use("/auth", authRoutes);       // → /api/auth/...
router.use("/projects", projectRoutes); // → /api/projects/...
router.use("/profile", profileRoutes);  // → /api/profile/...
router.use("/messages", messageRoutes); // → /api/messages/...

module.exports = router;
