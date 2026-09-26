import { Concern } from "../model/concern.models.js";
import { Auth } from "../model/auth.models.js";

// =========================================================
// CREATE CONCERN
// Mentee creates a concern
// =========================================================

export const createConcern = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
    } = req.body;

    // Required fields
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Get logged-in mentee
    const mentee = await Auth.findOne({
      _id: req.user.id,
      role: "Mentee",
      isApproved: true,
    }).select("mentor");

    if (!mentee) {
      return res.status(404).json({
        message: "Mentee not found",
      });
    }

    // Mentee must have a mentor
    if (!mentee.mentor) {
      return res.status(400).json({
        message: "You are not assigned to a mentor",
      });
    }

    // Validate category
    const validCategories = [
      "Academic",
      "Attendance",
      "Personal",
      "Career",
      "Financial",
      "Other",
    ];

    if (
      category &&
      !validCategories.includes(category)
    ) {
      return res.status(400).json({
        message: "Invalid concern category",
      });
    }

    // Validate priority
    const validPriorities = [
      "Low",
      "Medium",
      "High",
    ];

    if (
      priority &&
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    // Create concern
    const concern = await Concern.create({
      mentee: req.user.id,
      mentor: mentee.mentor,
      title: title.trim(),
      description: description.trim(),
      category: category || "Other",
      priority: priority || "Medium",
    });

    const populatedConcern =
      await Concern.findById(concern._id)
        .populate(
          "mentee",
          "name email course division semester rollNumber"
        )
        .populate(
          "mentor",
          "name email department designation"
        );

    res.status(201).json({
      message: "Concern submitted successfully",
      concern: populatedConcern,
    });
  } catch (error) {
    console.error("Create concern error:", error);

    res.status(500).json({
      message: "Failed to create concern",
    });
  }
};

// =========================================================
// GET MY CONCERNS
// Mentee sees their own concerns
// =========================================================

export const getMyConcerns = async (req, res) => {
  try {
    const concerns = await Concern.find({
      mentee: req.user.id,
    })
      .populate(
        "mentor",
        "name email department designation"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Concerns fetched successfully",
      concerns,
    });
  } catch (error) {
    console.error("Get my concerns error:", error);

    res.status(500).json({
      message: "Failed to fetch concerns",
    });
  }
};

// =========================================================
// GET MENTOR CONCERNS
// Mentor sees concerns from assigned mentees
// =========================================================

export const getMentorConcerns = async (req, res) => {
  try {
    const concerns = await Concern.find({
      mentor: req.user.id,
    })
      .populate(
        "mentee",
        "name email course division semester rollNumber"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Mentor concerns fetched successfully",
      concerns,
    });
  } catch (error) {
    console.error(
      "Get mentor concerns error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch mentor concerns",
    });
  }
};

// =========================================================
// GET SINGLE CONCERN
// =========================================================

export const getConcernById = async (req, res) => {
  try {
    const { id } = req.params;

    const concern = await Concern.findOne({
      _id: id,
      mentor: req.user.id,
    })
      .populate(
        "mentee",
        "name email course division semester rollNumber"
      )
      .populate(
        "mentor",
        "name email department designation"
      );

    if (!concern) {
      return res.status(404).json({
        message: "Concern not found",
      });
    }

    res.status(200).json({
      message: "Concern fetched successfully",
      concern,
    });
  } catch (error) {
    console.error(
      "Get concern error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch concern",
    });
  }
};

// =========================================================
// UPDATE CONCERN
// Mentor updates status, priority and response
// =========================================================

export const updateConcern = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      priority,
      mentorResponse,
    } = req.body;

    const concern = await Concern.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!concern) {
      return res.status(404).json({
        message: "Concern not found",
      });
    }

    // Validate status
    if (status !== undefined) {
      const validStatuses = [
        "Pending",
        "In Review",
        "Resolved",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid concern status",
        });
      }

      concern.status = status;
    }

    // Validate priority
    if (priority !== undefined) {
      const validPriorities = [
        "Low",
        "Medium",
        "High",
      ];

      if (
        !validPriorities.includes(priority)
      ) {
        return res.status(400).json({
          message: "Invalid priority",
        });
      }

      concern.priority = priority;
    }

    // Update mentor response
    if (mentorResponse !== undefined) {
      concern.mentorResponse =
        mentorResponse.trim();
    }

    await concern.save();

    const updatedConcern =
      await Concern.findById(concern._id)
        .populate(
          "mentee",
          "name email course division semester rollNumber"
        )
        .populate(
          "mentor",
          "name email department designation"
        );

    res.status(200).json({
      message: "Concern updated successfully",
      concern: updatedConcern,
    });
  } catch (error) {
    console.error(
      "Update concern error:",
      error
    );

    res.status(500).json({
      message: "Failed to update concern",
    });
  }
};

// =========================================================
// DELETE CONCERN
// Mentor can delete their concern
// =========================================================

export const deleteConcern = async (req, res) => {
  try {
    const { id } = req.params;

    const concern = await Concern.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!concern) {
      return res.status(404).json({
        message: "Concern not found",
      });
    }

    await Concern.findByIdAndDelete(id);

    res.status(200).json({
      message: "Concern deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete concern error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete concern",
    });
  }
};

export const getMenteeConcerns = async (req, res) => {
  try {
    const concerns = await Concern.find({
      mentee: req.user.id,
    })
      .populate(
        "mentor",
        "name email department designation"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Mentee concerns fetched successfully",
      concerns,
    });
  } catch (error) {
    console.error("Get mentee concerns error:", error);

    return res.status(500).json({
      message: "Failed to fetch concerns",
    });
  }
};