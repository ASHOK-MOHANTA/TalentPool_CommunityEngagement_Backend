const Profile = require("../models/Profile");
const User = require("../models/User");

/**
 * GET /api/profile/me
 * Get current logged-in user's profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", "name email role");
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profile/me
 * Create or update profile for logged-in user
 */
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const { bio, skills, portfolio, availability, location } = req.body;

    // Build profileFields
    const profileFields = {
      user: req.user._id,
      bio: bio || "",
      skills: Array.isArray(skills) ? skills : (skills ? JSON.parse(skills) : []),
      portfolio: Array.isArray(portfolio) ? portfolio : (portfolio ? JSON.parse(portfolio) : []),
      availability: availability || {},
      location: location || {}
    };

    let profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    // If body parsing JSON failed above, handle JSON.parse error for skills/portfolio
    if (err instanceof SyntaxError) return res.status(400).json({ message: "Invalid JSON in skills or portfolio" });
    next(err);
  }
};

/**
 * GET /api/profile/:id
 * Public profile view by profile ID or user ID
 * If the param looks like ObjectId we search Profile._id; otherwise try user id
 */
const getProfileById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let profile = await Profile.findOne({ user: id }).populate("user", "name email role");
    if (!profile) profile = await Profile.findById(id).populate("user", "name email role");
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/profiles
 * Search profiles with query params: skill, city, country, minHours, page, limit
 */
const searchProfiles = async (req, res, next) => {
  try {
    const { skill, city, country, minHours, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (skill) filter["skills.name"] = { $regex: new RegExp(skill, "i") };
    if (city) filter["location.city"] = { $regex: new RegExp(city, "i") };
    if (country) filter["location.country"] = { $regex: new RegExp(country, "i") };
    if (minHours) filter["availability.hoursPerWeek"] = { $gte: Number(minHours) };

    const skip = (Number(page) - 1) * Number(limit);
    const profiles = await Profile.find(filter)
      .populate("user", "name email role")
      .skip(skip)
      .limit(Number(limit));

    const total = await Profile.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), results: profiles });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  createOrUpdateProfile,
  getProfileById,
  searchProfiles
};
