const Project = require("../models/Project");

/**
 * Create Project (only project_owner)
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, requiredSkills, maxCollaborators, deadline } = req.body;

    const project = new Project({
      owner: req.user._id,
      title,
      description,
      requiredSkills,
      maxCollaborators,
      deadline
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all projects (with optional search by skill)
 * GET /api/projects?skill=React
 */
const getProjects = async (req, res, next) => {
  try {
    const { skill, status } = req.query;
    const filter = {};

    if (skill) filter.requiredSkills = { $regex: new RegExp(skill, "i") };
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email")
      .populate("waitlist", "name email");

    res.json(projects);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email")
      .populate("waitlist", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    next(err);
  }
};

/**
 * Join a project (user role)
 * POST /api/projects/:id/join
 */
const joinProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const alreadyJoined = project.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const inWaitlist = project.waitlist.find(u => u.toString() === req.user._id.toString());

    if (alreadyJoined) return res.status(400).json({ message: "Already joined" });
    if (project.collaborators.length < project.maxCollaborators) {
      project.collaborators.push({ user: req.user._id });
      await project.save();
      return res.json({ message: "Joined project successfully", project });
    } else if (!inWaitlist) {
      project.waitlist.push(req.user._id);
      await project.save();
      return res.json({ message: "Project full, added to waitlist", project });
    } else {
      return res.status(400).json({ message: "Already in waitlist" });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Leave project (user role)
 * POST /api/projects/:id/leave
 */
const leaveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.collaborators = project.collaborators.filter(c => c.user.toString() !== req.user._id.toString());
    project.waitlist = project.waitlist.filter(u => u.toString() !== req.user._id.toString());

    // Add first user from waitlist if space is available
    while (project.collaborators.length < project.maxCollaborators && project.waitlist.length > 0) {
      const nextUserId = project.waitlist.shift();
      project.collaborators.push({ user: nextUserId });
      // optionally, notify user here
    }

    await project.save();
    res.json({ message: "Left project successfully", project });
  } catch (err) {
    next(err);
  }
};

/**
 * Update project (only owner)
 * PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    const { title, description, requiredSkills, maxCollaborators, deadline, status } = req.body;

    project.title = title || project.title;
    project.description = description || project.description;
    project.requiredSkills = requiredSkills || project.requiredSkills;
    project.maxCollaborators = maxCollaborators || project.maxCollaborators;
    project.deadline = deadline || project.deadline;
    project.status = status || project.status;

    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  joinProject,
  leaveProject,
  updateProject
};
