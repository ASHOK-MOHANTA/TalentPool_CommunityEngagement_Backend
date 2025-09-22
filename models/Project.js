const mongoose = require("mongoose");

const CollaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  requiredSkills: [{ type: String }],
  maxCollaborators: { type: Number, default: 5 },
  collaborators: [CollaboratorSchema],
  waitlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  deadline: { type: Date },
  status: { type: String, enum: ["open", "closed", "completed"], default: "open" }
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
