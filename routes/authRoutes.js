const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route (any logged-in user)
router.get("/profile", protect, getProfile);

// Admin-only route
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin 🚀", user: req.user });
});

module.exports = router;
