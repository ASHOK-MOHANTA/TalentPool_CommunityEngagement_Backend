const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  joinProject,
  leaveProject,
  updateProject
} = require("../controllers/projectController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Get all projects (public or logged-in)
router.get("/", getProjects);

// Get single project by ID
router.get("/:id", getProjectById);

// Create project (only project_owner)
router.post("/", protect, authorizeRoles("project_owner"), createProject);

// Update project (only owner)
router.put("/:id", protect, authorizeRoles("project_owner"), updateProject);

// Join project (user)
router.post("/:id/join", protect, authorizeRoles("user", "project_owner"), joinProject);

// Leave project (user)
router.post("/:id/leave", protect, authorizeRoles("user", "project_owner"), leaveProject);

module.exports = router;
