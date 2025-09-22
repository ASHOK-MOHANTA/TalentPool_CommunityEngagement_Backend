const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 1, max: 5, default: 3 } // optional skill level
}, { _id: false });

const PortfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String }, // S3 or external link
  type: { type: String, enum: ["project", "image", "video", "document", "other"], default: "project" }
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bio: { type: String, default: "" },
  skills: { type: [SkillSchema], default: [] },
  portfolio: { type: [PortfolioItemSchema], default: [] },
  availability: {
    hoursPerWeek: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  location: { city: String, country: String },
  ratingAvg: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  pastProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }]
}, { timestamps: true });

module.exports = mongoose.model("Profile", ProfileSchema);
