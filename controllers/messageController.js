// controllers/messageController.js
const Message = require("../models/Message");

const getMessagesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ project: projectId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    let message = await Message.create({
      project: projectId,
      user: req.user._id,
      text,
    });

    // populate sender info
    message = await message.populate("user", "name email");

    // ✅ Emit to project room
    req.io.to(projectId).emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessagesByProject, sendMessage };
