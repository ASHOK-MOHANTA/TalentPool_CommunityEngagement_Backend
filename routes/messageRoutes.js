// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const { getMessagesByProject, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

// Get all messages for a project
router.get("/:projectId", protect, getMessagesByProject);

// Send a message
router.post("/:projectId", protect, sendMessage);

module.exports = router;
