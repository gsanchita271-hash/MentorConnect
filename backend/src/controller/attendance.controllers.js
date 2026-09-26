import { Attendance } from "../model/attendance.models.js";
import { Auth } from "../model/auth.models.js";

// Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { menteeId, date, status } = req.body;

    if (!menteeId || !date || !status) {
      return res.status(400).json({
        message: "Mentee, date and status are required",
      });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    // Check mentee belongs to this mentor
    const mentee = await Auth.findOne({
      _id: menteeId,
      role: "Mentee",
      isApproved: true,
      mentor: req.user.id,
    });

    if (!mentee) {
      return res.status(404).json({
        message: "Mentee not found or not assigned to you",
      });
    }

    // Prevent duplicate attendance for same date
    const existingAttendance = await Attendance.findOne({
      mentee: menteeId,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already marked for this date",
      });
    }

    const attendance = await Attendance.create({
      mentor: req.user.id,
      mentee: menteeId,
      date: new Date(date),
      status,
    });

    const populatedAttendance = await Attendance.findById(
      attendance._id
    ).populate(
      "mentee",
      "name email course division semester rollNumber"
    );

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);

    res.status(500).json({
      message: "Failed to mark attendance",
    });
  }
};


// Get Mentor's Attendance
export const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      mentor: req.user.id,
    })
      .populate(
        "mentee",
        "name email course division semester rollNumber"
      )
      .sort({ date: -1 });

    res.status(200).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
};

// Update Attendance
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Attendance status is required",
      });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    const attendance = await Attendance.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    attendance.status = status;

    await attendance.save();

    const updatedAttendance = await Attendance.findById(
      attendance._id
    ).populate(
      "mentee",
      "name email course division semester rollNumber"
    );

    res.status(200).json({
      message: "Attendance updated successfully",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    res.status(500).json({
      message: "Failed to update attendance",
    });
  }
};

export const getMenteeAttendanceHistory = async (req, res) => {
  try {
    const { menteeId } = req.params;

    if (!menteeId) {
      return res.status(400).json({
        message: "Mentee ID is required",
      });
    }

    // Check that this mentee belongs to the logged-in mentor
    const mentee = await Auth.findOne({
      _id: menteeId,
      role: "Mentee",
      isApproved: true,
      mentor: req.user.id,
    }).select("name email course division semester rollNumber");

    if (!mentee) {
      return res.status(404).json({
        message: "Mentee not found or not assigned to you",
      });
    }

    const history = await Attendance.find({
      mentor: req.user.id,
      mentee: menteeId,
    })
      .sort({ date: -1 })
      .select("date status createdAt updatedAt");

    res.status(200).json({
      message: "Attendance history fetched successfully",
      mentee,
      history,
    });
  } catch (error) {
    console.error("Get attendance history error:", error);

    res.status(500).json({
      message: "Failed to fetch attendance history",
    });
  }
};

export const getMenteeAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      mentee: req.user.id,
    })
      .populate(
        "mentor",
        "name email department designation"
      )
      .sort({ date: -1 });

    const total = attendance.length;

    const present = attendance.filter(
      (record) => record.status === "Present"
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "Absent"
    ).length;

    const percentage =
      total === 0
        ? 0
        : Number(((present / total) * 100).toFixed(2));

    return res.status(200).json({
      message: "Mentee attendance fetched successfully",
      attendance,
      summary: {
        total,
        present,
        absent,
        percentage,
      },
    });
  } catch (error) {
    console.error(
      "Get mentee attendance error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
};