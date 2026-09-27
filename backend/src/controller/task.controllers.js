import { Task } from "../model/task.models.js";
import { Auth } from "../model/auth.models.js";

// =====================================================
// CREATE TASK
// =====================================================

export const createTask = async (req, res) => {
  try {
    const {
      menteeIds,
      title,
      description,
      goal,
      priority,
      startDate,
      dueDate,
    } = req.body;

    // Basic validation
    if (
      !Array.isArray(menteeIds) ||
      menteeIds.length === 0 ||
      !title ||
      !startDate ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "Mentees, title, start date and due date are required",
      });
    }

    // Check dates
    if (new Date(dueDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "Due date cannot be before start date",
      });
    }

    // Validate priority
    const validPriorities = ["Low", "Medium", "High"];

    if (
      priority &&
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    // Make sure selected mentees belong to this mentor
    const mentees = await Auth.find({
      _id: { $in: menteeIds },
      role: "Mentee",
      isApproved: true,
      mentor: req.user.id,
    }).select("_id");

    if (mentees.length !== menteeIds.length) {
      return res.status(403).json({
        message:
          "One or more selected mentees are not assigned to you",
      });
    }

    // Create task
    const task = await Task.create({
      mentor: req.user.id,
      mentees: menteeIds,
      title: title.trim(),
      description: description?.trim() || "",
      goal: goal?.trim() || "",
      priority: priority || "Medium",
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
    });

    // Populate mentees
    const populatedTask = await Task.findById(task._id)
      .populate(
        "mentees",
        "name email course division semester rollNumber"
      );

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
};


// =====================================================
// GET MY TASKS
// =====================================================

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      mentor: req.user.id,
    })
      .populate(
        "mentees",
        "name email course division semester rollNumber"
      )
      .sort({ dueDate: 1 });

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
};


// =====================================================
// GET SINGLE TASK
// =====================================================

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      mentor: req.user.id,
    }).populate(
      "mentees",
      "name email course division semester rollNumber"
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
};


// =====================================================
// UPDATE TASK
// =====================================================

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      menteeIds,
      title,
      description,
      goal,
      priority,
      status,
      startDate,
      dueDate,
    } = req.body;

    const task = await Task.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Validate mentees if provided
    if (menteeIds !== undefined) {
      if (
        !Array.isArray(menteeIds) ||
        menteeIds.length === 0
      ) {
        return res.status(400).json({
          message: "At least one mentee is required",
        });
      }

      const mentees = await Auth.find({
        _id: { $in: menteeIds },
        role: "Mentee",
        isApproved: true,
        mentor: req.user.id,
      }).select("_id");

      if (mentees.length !== menteeIds.length) {
        return res.status(403).json({
          message:
            "One or more selected mentees are not assigned to you",
        });
      }

      task.mentees = menteeIds;
    }

    // Update text fields
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Task title is required",
        });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (goal !== undefined) {
      task.goal = goal.trim();
    }

    // Priority
    if (priority !== undefined) {
      const validPriorities = [
        "Low",
        "Medium",
        "High",
      ];

      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          message: "Invalid priority",
        });
      }

      task.priority = priority;
    }

    // Status
    if (status !== undefined) {
      const validStatuses = [
        "Pending",
        "In Progress",
        "Completed",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid task status",
        });
      }

      task.status = status;
    }

    // Dates
    const newStartDate =
      startDate !== undefined
        ? new Date(startDate)
        : task.startDate;

    const newDueDate =
      dueDate !== undefined
        ? new Date(dueDate)
        : task.dueDate;

    if (newDueDate < newStartDate) {
      return res.status(400).json({
        message: "Due date cannot be before start date",
      });
    }

    if (startDate !== undefined) {
      task.startDate = newStartDate;
    }

    if (dueDate !== undefined) {
      task.dueDate = newDueDate;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate(
        "mentees",
        "name email course division semester rollNumber"
      );

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
};


// =====================================================
// DELETE TASK
// =====================================================

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
};

export const getMenteeTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      mentees: req.user.id,
    })
      .populate(
        "mentor",
        "name email department designation"
      )
      .sort({ dueDate: 1 });

    return res.status(200).json({
      message: "Mentee tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    console.error("Get mentee tasks error:", error);

    return res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
};