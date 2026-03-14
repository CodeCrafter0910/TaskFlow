const Task = require("../models/Task");

const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };

    if (status && ["todo", "in-progress", "done"].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim().length > 0) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks." });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid task ID." });
    }
    res.status(500).json({ success: false, message: "Failed to fetch task." });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.create({
      title,
      description: description || "",
      status: status || "todo",
      user: req.user._id,
    });

    res.status(201).json({ success: true, message: "Task created.", data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create task." });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    res.json({ success: true, message: "Task updated.", data: task });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid task ID." });
    }
    res.status(500).json({ success: false, message: "Failed to update task." });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    res.json({ success: true, message: "Task deleted." });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid task ID." });
    }
    res.status(500).json({ success: false, message: "Failed to delete task." });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
