import { Meeting } from "../model/meeting.models.js";
import { Auth } from "../model/auth.models.js";

// Create Meeting for Multiple Mentees
export const createMeeting = async (req, res) => {
  try {
    const {
      menteeIds,
      title,
      agenda,
      date,
      meetingLink,
    } = req.body;

    if (
      !Array.isArray(menteeIds) ||
      menteeIds.length === 0 ||
      !title ||
      !date ||
      !meetingLink
    ) {
      return res.status(400).json({
        message:
          "Mentees, title, date and meeting link are required",
      });
    }

    // Check that all selected mentees belong to this mentor
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

    const meeting = await Meeting.create({
      mentor: req.user.id,
      mentees: menteeIds,
      title: title.trim(),
      agenda: agenda?.trim() || "",
      meetingLink: meetingLink.trim(),
      date,
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate(
        "mentees",
        "name email course division semester rollNumber"
      );

    res.status(201).json({
      message: "Meeting scheduled successfully",
      meeting: populatedMeeting,
    });
  } catch (error) {
    console.error("Create meeting error:", error);

    res.status(500).json({
      message: "Failed to schedule meeting",
    });
  }
};


// Get Mentor's Meetings
export const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      mentor: req.user.id,
    })
      .populate(
        "mentees",
        "name email course division semester rollNumber"
      )
      .sort({ date: 1 });

    res.status(200).json({
      message: "Meetings fetched successfully",
      meetings,
    });
  } catch (error) {
    console.error("Get meetings error:", error);

    res.status(500).json({
      message: "Failed to fetch meetings",
    });
  }
};

export const getMenteeMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      mentees: req.user.id,
    })
      .populate(
        "mentor",
        "name email department designation"
      )
      .sort({ date: 1 });

    return res.status(200).json({
      message: "Mentee meetings fetched successfully",
      meetings,
    });
  } catch (error) {
    console.error("Get mentee meetings error:", error);

    return res.status(500).json({
      message: "Failed to fetch meetings",
    });
  }
};