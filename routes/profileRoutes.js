const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  createOrUpdateProfile,
  getProfileById,
  searchProfiles
} = require("../controllers/profileController");

const { protect } = require("../middlewares/authMiddleware");

// Get my profile (protected)
router.get("/me", protect, getMyProfile);

// Create or update my profile (protected)
router.put("/me", protect, createOrUpdateProfile);

// Public get profile by id or user id
router.get("/:id", getProfileById);

// Search profiles
router.get("/", searchProfiles);

module.exports = router;
