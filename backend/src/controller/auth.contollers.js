import { Auth } from "../model/auth.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      course,
      division,
      semester,
      rollNumber,
      ern,
      department,
      designation,
      employeeId,
      qualification,
      experience,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const normalizedRole = String(role).trim();

    const allowedRoles = ["Admin", "Mentor", "Mentee"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // ==================================================
    // MENTEE VALIDATION
    // ==================================================

    if (normalizedRole === "Mentee") {
      if (
        !course ||
        !division ||
        !semester ||
        !rollNumber ||
        !ern
      ) {
        return res.status(400).json({
          message:
            "Course, division, semester, roll number and ERN are required for mentee",
        });
      }

      const normalizedErn = String(ern).trim().toUpperCase();

      const existingErn = await User.findOne({
        ern: normalizedErn,
      });

      if (existingErn) {
        return res.status(409).json({
          message: "ERN already registered",
        });
      }
    }

    // ==================================================
    // MENTOR VALIDATION
    // ==================================================

    if (normalizedRole === "Mentor") {
      if (
        !department ||
        !designation ||
        !employeeId
      ) {
        return res.status(400).json({
          message:
            "Department, designation and employee ID are required for mentor",
        });
      }

      const existingEmployee = await User.findOne({
        employeeId: String(employeeId).trim(),
      });

      if (existingEmployee) {
        return res.status(409).json({
          message: "Employee ID already registered",
        });
      }
    }

    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==================================================
    // CREATE USER
    // ==================================================

    const userData = {
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      isApproved: normalizedRole === "Admin",
    };

    // Mentee fields
    if (normalizedRole === "Mentee") {
      userData.course = String(course).trim();
      userData.division = String(division).trim();
      userData.semester = Number(semester);
      userData.rollNumber = String(rollNumber).trim();
      userData.ern = String(ern).trim().toUpperCase();
      userData.mentor = null;
    }

    // Mentor fields
    if (normalizedRole === "Mentor") {
      userData.department = String(department).trim();
      userData.designation = String(designation).trim();
      userData.employeeId = String(employeeId).trim();
      userData.qualification = qualification
        ? String(qualification).trim()
        : "";
      userData.experience = experience
        ? String(experience).trim()
        : "";
    }

    const user = await User.create(userData);

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      message:
        normalizedRole === "Admin"
          ? "Admin registered successfully"
          : "Registration successful. Waiting for admin approval.",
      user: safeUser,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message:
          "Your account is waiting for admin approval",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

// ======================================================
// APPROVE USER
// ======================================================

const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isApproved = true;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      message: "User approved successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("APPROVE USER ERROR:", error);

    return res.status(500).json({
      message: "Server error while approving user",
      error: error.message,
    });
  }
};

// ======================================================
// GET PENDING USERS
// ======================================================

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      isApproved: false,
      role: {
        $in: ["Mentor", "Mentee"],
      },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("GET PENDING USERS ERROR:", error);

    return res.status(500).json({
      message: "Server error while fetching pending users",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: {
        $in: ["Mentor", "Mentee"],
      },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY PROFILE
// ======================================================

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate(
        "mentor",
        "name email department designation employeeId qualification experience"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("GET MY PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Server error while fetching profile",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE MY PROFILE
// ======================================================

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      name,
      email,
      course,
      division,
      semester,
      rollNumber,
      ern,
      department,
      designation,
      employeeId,
      qualification,
      experience,
    } = req.body;

    // ==================================================
    // NAME
    // ==================================================

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    // ==================================================
    // EMAIL
    // ==================================================

    if (email !== undefined) {
      const normalizedEmail = String(email)
        .trim()
        .toLowerCase();

      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      user.email = normalizedEmail;
    }

    // ==================================================
    // MENTEE PROFILE
    // ==================================================

    if (user.role === "Mentee") {
      if (course !== undefined) {
        user.course = String(course).trim();
      }

      if (division !== undefined) {
        user.division = String(division).trim();
      }

      if (semester !== undefined) {
        user.semester = Number(semester);
      }

      if (rollNumber !== undefined) {
        user.rollNumber = String(rollNumber).trim();
      }

      if (ern !== undefined) {
        const normalizedErn = String(ern)
          .trim()
          .toUpperCase();

        const existingErn = await User.findOne({
          ern: normalizedErn,
          _id: { $ne: user._id },
        });

        if (existingErn) {
          return res.status(409).json({
            message: "ERN already registered",
          });
        }

        user.ern = normalizedErn;
      }
    }

    // ==================================================
    // MENTOR PROFILE
    // ==================================================

    if (user.role === "Mentor") {
      if (department !== undefined) {
        user.department = String(department).trim();
      }

      if (designation !== undefined) {
        user.designation = String(designation).trim();
      }

      if (employeeId !== undefined) {
        const normalizedEmployeeId =
          String(employeeId).trim();

        const existingEmployee = await User.findOne({
          employeeId: normalizedEmployeeId,
          _id: { $ne: user._id },
        });

        if (existingEmployee) {
          return res.status(409).json({
            message: "Employee ID already registered",
          });
        }

        user.employeeId = normalizedEmployeeId;
      }

      if (qualification !== undefined) {
        user.qualification =
          String(qualification).trim();
      }

      if (experience !== undefined) {
        user.experience = String(experience).trim();
      }
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("UPDATE MY PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN - UPDATE USER
// ======================================================

const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Admin dashboard should only edit Mentor/Mentee
    if (!["Mentor", "Mentee"].includes(user.role)) {
      return res.status(400).json({
        message: "Admin users cannot be edited here",
      });
    }

    const {
      name,
      email,
      course,
      division,
      semester,
      rollNumber,
      ern,
      department,
      designation,
      employeeId,
      qualification,
      experience,
    } = req.body;

    // ==================================================
    // COMMON FIELDS
    // ==================================================

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (email !== undefined) {
      const normalizedEmail = String(email)
        .trim()
        .toLowerCase();

      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      user.email = normalizedEmail;
    }

    // ==================================================
    // MENTEE
    // ==================================================

    if (user.role === "Mentee") {
      if (course !== undefined) {
        user.course = String(course).trim();
      }

      if (division !== undefined) {
        user.division = String(division).trim();
      }

      if (semester !== undefined) {
        const numericSemester = Number(semester);

        if (
          Number.isNaN(numericSemester) ||
          numericSemester < 1
        ) {
          return res.status(400).json({
            message: "Invalid semester",
          });
        }

        user.semester = numericSemester;
      }

      if (rollNumber !== undefined) {
        user.rollNumber =
          String(rollNumber).trim();
      }

      if (ern !== undefined) {
        const normalizedErn = String(ern)
          .trim()
          .toUpperCase();

        const existingErn = await User.findOne({
          ern: normalizedErn,
          _id: { $ne: user._id },
        });

        if (existingErn) {
          return res.status(409).json({
            message: "ERN already registered",
          });
        }

        user.ern = normalizedErn;
      }
    }

    // ==================================================
    // MENTOR
    // ==================================================

    if (user.role === "Mentor") {
      if (department !== undefined) {
        user.department =
          String(department).trim();
      }

      if (designation !== undefined) {
        user.designation =
          String(designation).trim();
      }

      if (employeeId !== undefined) {
        const normalizedEmployeeId =
          String(employeeId).trim();

        const existingEmployee = await User.findOne({
          employeeId: normalizedEmployeeId,
          _id: { $ne: user._id },
        });

        if (existingEmployee) {
          return res.status(409).json({
            message: "Employee ID already registered",
          });
        }

        user.employeeId = normalizedEmployeeId;
      }

      if (qualification !== undefined) {
        user.qualification =
          String(qualification).trim();
      }

      if (experience !== undefined) {
        user.experience =
          String(experience).trim();
      }
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("ADMIN UPDATE USER ERROR:", error);

    return res.status(500).json({
      message: "Server error while updating user",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY MENTEES
// ======================================================

const getMyMentees = async (req, res) => {
  try {
    const mentees = await User.find({
      role: "Mentee",
      mentor: req.user.id,
      isApproved: true,
    })
      .select("-password")
      .sort({ name: 1 });

    return res.status(200).json({
      mentees,
    });
  } catch (error) {
    console.error("GET MY MENTEES ERROR:", error);

    return res.status(500).json({
      message: "Server error while fetching mentees",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN ONE MENTEE
// ======================================================

const assignMentee = async (req, res) => {
  try {
    const { menteeId, mentorId } = req.body;

    if (!menteeId || !mentorId) {
      return res.status(400).json({
        message: "Mentee ID and mentor ID are required",
      });
    }

    const mentee = await User.findOne({
      _id: menteeId,
      role: "Mentee",
    });

    if (!mentee) {
      return res.status(404).json({
        message: "Mentee not found",
      });
    }

    const mentor = await User.findOne({
      _id: mentorId,
      role: "Mentor",
      isApproved: true,
    });

    if (!mentor) {
      return res.status(404).json({
        message: "Approved mentor not found",
      });
    }

    mentee.mentor = mentor._id;

    await mentee.save();

    const safeUser = mentee.toObject();
    delete safeUser.password;

    return res.status(200).json({
      message: "Mentee assigned successfully",
      mentee: safeUser,
    });
  } catch (error) {
    console.error("ASSIGN MENTEE ERROR:", error);

    return res.status(500).json({
      message: "Server error while assigning mentee",
      error: error.message,
    });
  }
};

// ======================================================
// REJECT USER
// ======================================================

const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        message: "Approved users cannot be rejected",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Registration rejected and removed",
    });
  } catch (error) {
    console.error("REJECT USER ERROR:", error);

    return res.status(500).json({
      message: "Server error while rejecting user",
      error: error.message,
    });
  }
};

// ======================================================
// REMOVE USER
// ======================================================

const removeUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Never allow Admin account deletion
    if (user.role === "Admin") {
      return res.status(403).json({
        message: "Admin users cannot be removed",
      });
    }

    // If removing mentor, unassign their mentees
    if (user.role === "Mentor") {
      await User.updateMany(
        {
          role: "Mentee",
          mentor: user._id,
        },
        {
          $set: {
            mentor: null,
          },
        }
      );
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: `${user.role} removed successfully`,
    });
  } catch (error) {
    console.error("REMOVE USER ERROR:", error);

    return res.status(500).json({
      message: "Server error while removing user",
      error: error.message,
    });
  }
};

// ======================================================
// GET MENTEE GROUPS
// ======================================================

const getMenteeGroups = async (req, res) => {
  try {
    const mentees = await User.find({
      role: "Mentee",
      isApproved: true,
    })
      .select(
        "name email course division semester rollNumber ern mentor"
      )
      .populate(
        "mentor",
        "name email department designation employeeId"
      )
      .sort({
        course: 1,
        division: 1,
        name: 1,
      });

    const groups = {};

    mentees.forEach((mentee) => {
      const course = mentee.course || "Unknown Course";
      const division =
        mentee.division || "Unknown Division";

      const key = `${course}-${division}`;

      if (!groups[key]) {
        groups[key] = {
          course,
          division,
          mentees: [],
        };
      }

      groups[key].mentees.push(mentee);
    });

    return res.status(200).json({
      groups: Object.values(groups),
    });
  } catch (error) {
    console.error("GET MENTEE GROUPS ERROR:", error);

    return res.status(500).json({
      message:
        "Server error while fetching mentee groups",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN MULTIPLE MENTEES
// ======================================================

const assignMentees = async (req, res) => {
  try {
    const { menteeIds, mentorId } = req.body;

    if (
      !Array.isArray(menteeIds) ||
      menteeIds.length === 0 ||
      !mentorId
    ) {
      return res.status(400).json({
        message:
          "Mentee IDs and mentor ID are required",
      });
    }

    const mentor = await User.findOne({
      _id: mentorId,
      role: "Mentor",
      isApproved: true,
    });

    if (!mentor) {
      return res.status(404).json({
        message: "Approved mentor not found",
      });
    }

    const result = await User.updateMany(
      {
        _id: {
          $in: menteeIds,
        },
        role: "Mentee",
        isApproved: true,
      },
      {
        $set: {
          mentor: mentor._id,
        },
      }
    );

    return res.status(200).json({
      message: "Mentees assigned successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("ASSIGN MENTEES ERROR:", error);

    return res.status(500).json({
      message:
        "Server error while assigning mentees",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY MENTOR
// ======================================================

const getMyMentor = async (req, res) => {
  try {
    const mentee = await User.findById(req.user.id)
      .select("mentor")
      .populate(
        "mentor",
        "name email department designation employeeId qualification experience"
      );

    if (!mentee) {
      return res.status(404).json({
        message: "Mentee not found",
      });
    }

    if (!mentee.mentor) {
      return res.status(200).json({
        mentor: null,
        message: "No mentor assigned yet",
      });
    }

    return res.status(200).json({
      mentor: mentee.mentor,
    });
  } catch (error) {
    console.error("GET MY MENTOR ERROR:", error);

    return res.status(500).json({
      message: "Server error while fetching mentor",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

export {
  registerUser,
  loginUser,
  approveUser,
  getPendingUsers,
  getAllUsers,
  getMyProfile,
  updateMyProfile,
  updateUserByAdmin,
  getMyMentees,
  assignMentee,
  rejectUser,
  removeUser,
  getMenteeGroups,
  assignMentees,
  getMyMentor,
};