import { Announcement } from "../model/announcement.models.js";
import { Auth } from "../model/auth.models.js";

// ======================================================
// CREATE ANNOUNCEMENT
// ======================================================

export const createAnnouncement = async (req, res) => {
  try {
    const {
      mentees,
      title,
      message,
      priority,
      publishDate,
    } = req.body;

    // Required fields
    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    // Mentees required
    if (!Array.isArray(mentees) || mentees.length === 0) {
      return res.status(400).json({
        message: "At least one mentee is required",
      });
    }

    // Check selected mentees
    // belong to logged-in mentor
    const validMentees = await Auth.find({
      _id: { $in: mentees },
      role: "Mentee",
      isApproved: true,
      mentor: req.user.id,
    }).select("_id");

    if (validMentees.length !== mentees.length) {
      return res.status(403).json({
        message: "One or more mentees are not assigned to you",
      });
    }

    // Valid priorities
    const validPriorities = [
      "Normal",
      "Important",
      "Urgent",
    ];

    if (
      priority &&
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    // Create announcement
    const announcement = await Announcement.create({
      mentor: req.user.id,
      mentees,
      title: title.trim(),
      message: message.trim(),
      priority: priority || "Normal",
      publishDate: publishDate || new Date(),
    });

    // Populate announcement
    const populatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate(
          "mentor",
          "name email department designation"
        )
        .populate(
          "mentees",
          "name email course division semester rollNumber"
        );

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement: populatedAnnouncement,
    });

  } catch (error) {
    console.error(
      "Create announcement error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create announcement",
    });
  }
};


// ======================================================
// GET MY ANNOUNCEMENTS
// Mentor
// ======================================================

export const getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      mentor: req.user.id,
    })
      .populate(
        "mentees",
        "name email course division semester rollNumber"
      )
      .sort({ publishDate: -1 });

    return res.status(200).json({
      message: "Announcements fetched successfully",
      announcements,
    });

  } catch (error) {
    console.error(
      "Get announcements error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch announcements",
    });
  }
};


// ======================================================
// GET SINGLE ANNOUNCEMENT
// Mentor
// ======================================================

export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findOne({
      _id: id,
      mentor: req.user.id,
    })
      .populate(
        "mentor",
        "name email department designation"
      )
      .populate(
        "mentees",
        "name email course division semester rollNumber"
      );

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      message: "Announcement fetched successfully",
      announcement,
    });

  } catch (error) {
    console.error(
      "Get announcement error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch announcement",
    });
  }
};


// ======================================================
// UPDATE ANNOUNCEMENT
// Mentor
// ======================================================

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      mentees,
      title,
      message,
      priority,
      publishDate,
    } = req.body;

    const announcement = await Announcement.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    // Update mentees
    if (mentees !== undefined) {
      if (
        !Array.isArray(mentees) ||
        mentees.length === 0
      ) {
        return res.status(400).json({
          message: "At least one mentee is required",
        });
      }

      const validMentees = await Auth.find({
        _id: { $in: mentees },
        role: "Mentee",
        isApproved: true,
        mentor: req.user.id,
      }).select("_id");

      if (validMentees.length !== mentees.length) {
        return res.status(403).json({
          message:
            "One or more mentees are not assigned to you",
        });
      }

      announcement.mentees = mentees;
    }

    // Update title
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }

      announcement.title = title.trim();
    }

    // Update message
    if (message !== undefined) {
      if (!message.trim()) {
        return res.status(400).json({
          message: "Message cannot be empty",
        });
      }

      announcement.message = message.trim();
    }

    // Update priority
    if (priority !== undefined) {
      const validPriorities = [
        "Normal",
        "Important",
        "Urgent",
      ];

      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          message: "Invalid priority",
        });
      }

      announcement.priority = priority;
    }

    // Update publish date
    if (publishDate !== undefined) {
      announcement.publishDate = publishDate;
    }

    await announcement.save();

    const updatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate(
          "mentor",
          "name email department designation"
        )
        .populate(
          "mentees",
          "name email course division semester rollNumber"
        );

    return res.status(200).json({
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    });

  } catch (error) {
    console.error(
      "Update announcement error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update announcement",
    });
  }
};


// ======================================================
// DELETE ANNOUNCEMENT
// Mentor
// ======================================================

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    await Announcement.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Announcement deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete announcement error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete announcement",
    });
  }
};


// ======================================================
// GET MENTEE ANNOUNCEMENTS
// Mentee
// ======================================================

export const getMenteeAnnouncements = async (req, res) => {
  try {
    // Logged-in mentee ID
    const menteeId = req.user.id;

    console.log(
      "Mentee ID:",
      menteeId
    );

    // Find announcements where
    // logged-in mentee exists inside mentees array
    const announcements = await Announcement.find({
      mentees: menteeId,
    })
      .populate(
        "mentor",
        "name email department designation"
      )
      .sort({
        publishDate: -1,
      });

    console.log(
      "Announcements found:",
      announcements.length
    );

    console.log(
      "Announcements:",
      announcements
    );

    return res.status(200).json({
      message:
        "Mentee announcements fetched successfully",

      announcements,
    });

  } catch (error) {
    console.error(
      "Get mentee announcements error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch announcements",
    });
  }
};