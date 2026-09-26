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
      department,
      designation,
      qualification,
      experience,
      employeeId,
      course,
      division,
      semester,
      rollNumber,
      ern,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    if (!["Admin", "Mentor", "Mentee"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // =========================
    // MENTEE VALIDATION
    // =========================

    if (role === "Mentee") {
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
    }

    // =========================
    // MENTOR VALIDATION
    // =========================

    if (role === "Mentor") {
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
    }

    // =========================
    // EMAIL DUPLICATE
    // =========================

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await Auth.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists with this email",
      });
    }

    // =========================
    // ERN DUPLICATE
    // =========================

    let normalizedErn;

    if (role === "Mentee") {
      normalizedErn =
        ern.trim().toUpperCase();

      const existingErn =
        await Auth.findOne({
          ern: normalizedErn,
        });

      if (existingErn) {
        return res.status(400).json({
          message:
            "This ERN is already registered",
        });
      }
    }

    // =========================
    // PASSWORD
    // =========================

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // =========================
    // CREATE USER
    // =========================

    const user = await Auth.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,

      // Mentor
      department:
        role === "Mentor"
          ? department
          : undefined,

      designation:
        role === "Mentor"
          ? designation
          : undefined,

      qualification:
        role === "Mentor"
          ? qualification
          : undefined,

      experience:
        role === "Mentor"
          ? experience
          : undefined,

      employeeId:
        role === "Mentor"
          ? employeeId
          : undefined,

      // Mentee
      course:
        role === "Mentee"
          ? course
          : undefined,

      division:
        role === "Mentee"
          ? division
          : undefined,

      semester:
        role === "Mentee"
          ? semester
          : undefined,

      rollNumber:
        role === "Mentee"
          ? rollNumber
          : undefined,

      ern:
        role === "Mentee"
          ? normalizedErn
          : undefined,

      // Everyone needs admin approval
      isApproved: false,

      // No mentor initially
      mentor: undefined,
    });

    return res.status(201).json({
      message:
        "Registration successful. Wait for admin approval.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,

        course: user.course,
        division: user.division,
        semester: user.semester,
        rollNumber: user.rollNumber,
        ern: user.ern,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await Auth.findOne({
        email:
          email.toLowerCase().trim(),
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found. Please register first.",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message:
          "Your account is waiting for admin approval.",
      });
    }

    const token =
      jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

    return res.status(200).json({
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        ern: user.ern,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ======================================================
// APPROVE USER
// ======================================================

const approveUser = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const user =
      await Auth.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        message:
          "User is already approved",
      });
    }

    user.isApproved = true;

    await user.save();

    return res.status(200).json({
      message:
        "User approved successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved:
          user.isApproved,
      },
    });
  } catch (error) {
    console.error(
      "Approve user error:",
      error
    );

    return res.status(500).json({
      message: "Approval failed",
      error: error.message,
    });
  }
};

// ======================================================
// GET PENDING USERS
// ======================================================

const getPendingUsers = async (
  req,
  res
) => {
  try {
    const users =
      await Auth.find({
        isApproved: false,
        role: {
          $in: [
            "Mentor",
            "Mentee",
          ],
        },
      })
        .select("-password")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "Pending users fetched successfully",

      users,
    });
  } catch (error) {
    console.error(
      "Pending users error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch pending users",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async (
  req,
  res
) => {
  try {
    const users =
      await Auth.find({
        role: {
          $in: [
            "Mentor",
            "Mentee",
          ],
        },
      })
        .select("-password")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "Users fetched successfully",

      users,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch users",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY PROFILE
// ======================================================

const getMyProfile = async (
  req,
  res
) => {
  try {
    const user =
      await Auth.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let profile;

    // =========================
    // MENTOR
    // =========================

    if (
      user.role === "Mentor"
    ) {
      profile = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved:
          user.isApproved,

        department:
          user.department,

        designation:
          user.designation,

        employeeId:
          user.employeeId,

        experience:
          user.experience,

        qualification:
          user.qualification,
      };
    }

    // =========================
    // MENTEE
    // =========================

    else if (
      user.role === "Mentee"
    ) {
      profile = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved:
          user.isApproved,

        course: user.course,
        division: user.division,
        semester: user.semester,
        rollNumber:
          user.rollNumber,

        ern: user.ern,

        mentor:
          user.mentor || null,
      };
    }

    // =========================
    // ADMIN
    // =========================

    else {
      profile = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved:
          user.isApproved,
      };
    }

    return res.status(200).json({
      message:
        "Profile fetched successfully",

      user: profile,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch profile",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE MY PROFILE
// ======================================================

const updateMyProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,

      // Mentor
      department,
      designation,
      employeeId,
      qualification,
      experience,

      // Mentee
      course,
      division,
      semester,
      rollNumber,
      ern,
    } = req.body;

    const user =
      await Auth.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =========================
    // MENTOR
    // =========================

    if (
      user.role === "Mentor"
    ) {
      if (name?.trim()) {
        user.name =
          name.trim();
      }

      if (email) {
        const normalizedEmail =
          email
            .toLowerCase()
            .trim();

        const existingEmail =
          await Auth.findOne({
            email:
              normalizedEmail,
            _id: {
              $ne: user._id,
            },
          });

        if (existingEmail) {
          return res.status(400).json({
            message:
              "This email is already registered",
          });
        }

        user.email =
          normalizedEmail;
      }

      user.department =
        department ??
        user.department;

      user.designation =
        designation ??
        user.designation;

      user.employeeId =
        employeeId ??
        user.employeeId;

      user.qualification =
        qualification ??
        user.qualification;

      user.experience =
        experience ??
        user.experience;
    }

    // =========================
    // MENTEE
    // =========================

    else if (
      user.role === "Mentee"
    ) {
      if (name?.trim()) {
        user.name =
          name.trim();
      }

      if (email) {
        const normalizedEmail =
          email
            .toLowerCase()
            .trim();

        const existingEmail =
          await Auth.findOne({
            email:
              normalizedEmail,
            _id: {
              $ne: user._id,
            },
          });

        if (existingEmail) {
          return res.status(400).json({
            message:
              "This email is already registered",
          });
        }

        user.email =
          normalizedEmail;
      }

      if (
        course !== undefined
      ) {
        user.course =
          course;
      }

      if (
        division !== undefined
      ) {
        user.division =
          division;
      }

      if (
        semester !== undefined
      ) {
        user.semester =
          semester;
      }

      if (
        rollNumber !== undefined
      ) {
        user.rollNumber =
          rollNumber;
      }

      if (ern) {
        const normalizedErn =
          ern
            .trim()
            .toUpperCase();

        const existingErn =
          await Auth.findOne({
            ern: normalizedErn,
            _id: {
              $ne: user._id,
            },
          });

        if (existingErn) {
          return res.status(400).json({
            message:
              "This ERN is already registered",
          });
        }

        user.ern =
          normalizedErn;
      }
    }

    // =========================
    // OTHER ROLE
    // =========================

    else {
      return res.status(403).json({
        message:
          "Profile update is not allowed for this role",
      });
    }

    await user.save();

    return res.status(200).json({
      message:
        "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved:
          user.isApproved,

        department:
          user.department,

        designation:
          user.designation,

        employeeId:
          user.employeeId,

        qualification:
          user.qualification,

        experience:
          user.experience,

        course:
          user.course,

        division:
          user.division,

        semester:
          user.semester,

        rollNumber:
          user.rollNumber,

        ern:
          user.ern,

        mentor:
          user.mentor || null,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update profile",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY MENTEES
// ======================================================

const getMyMentees = async (
  req,
  res
) => {
  try {
    const mentees =
      await Auth.find({
        role: "Mentee",
        isApproved: true,
        mentor: req.user.id,
      }).select(
        "name email course division semester rollNumber ern mentor"
      );

    return res.status(200).json({
      message:
        "Mentees fetched successfully",

      mentees,
    });
  } catch (error) {
    console.error(
      "Get my mentees error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch mentees",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN ONE MENTEE
// ======================================================

const assignMentee = async (
  req,
  res
) => {
  try {
    const {
      menteeId,
      mentorId,
    } = req.body;

    if (
      !menteeId ||
      !mentorId
    ) {
      return res.status(400).json({
        message:
          "menteeId and mentorId are required",
      });
    }

    const mentee =
      await Auth.findById(
        menteeId
      );

    const mentor =
      await Auth.findById(
        mentorId
      );

    if (!mentee) {
      return res.status(404).json({
        message:
          "Mentee not found",
      });
    }

    if (!mentor) {
      return res.status(404).json({
        message:
          "Mentor not found",
      });
    }

    if (
      mentee.role !==
      "Mentee"
    ) {
      return res.status(400).json({
        message:
          "Selected user is not a mentee",
      });
    }

    if (
      !mentee.isApproved
    ) {
      return res.status(400).json({
        message:
          "Mentee is not approved",
      });
    }

    if (
      mentor.role !==
      "Mentor"
    ) {
      return res.status(400).json({
        message:
          "Selected user is not a mentor",
      });
    }

    if (
      !mentor.isApproved
    ) {
      return res.status(400).json({
        message:
          "Mentor is not approved",
      });
    }

    mentee.mentor =
      mentor._id;

    await mentee.save();

    return res.status(200).json({
      message:
        "Mentee assigned successfully",

      mentee: {
        id: mentee._id,
        name: mentee.name,
        mentor: mentor.name,
      },
    });
  } catch (error) {
    console.error(
      "Assign mentee error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to assign mentee",
      error: error.message,
    });
  }
};

// ======================================================
// REJECT PENDING USER
// ======================================================

const rejectUser = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const user =
      await Auth.findById(id);

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        message:
          "Approved user cannot be rejected. Use remove user instead.",
      });
    }

    await Auth.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      message:
        "User rejected successfully",
    });
  } catch (error) {
    console.error(
      "Reject user error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to reject user",
      error: error.message,
    });
  }
};

// ======================================================
// REMOVE APPROVED USER
// ======================================================

const removeUser = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const user =
      await Auth.findById(id);

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    // Admin account cannot be removed
    if (
      user.role === "Admin"
    ) {
      return res.status(400).json({
        message:
          "Admin account cannot be removed",
      });
    }

    // =========================
    // IF MENTOR IS REMOVED
    // =========================

    if (
      user.role === "Mentor"
    ) {
      await Auth.updateMany(
        {
          mentor: user._id,
        },
        {
          $unset: {
            mentor: 1,
          },
        }
      );
    }

    await Auth.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      message:
        `${user.role} removed successfully`,
    });
  } catch (error) {
    console.error(
      "Remove user error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to remove user",
      error: error.message,
    });
  }
};

// ======================================================
// GET MENTEE GROUPS
// ======================================================

const getMenteeGroups = async (
  req,
  res
) => {
  try {
    const mentees =
      await Auth.find({
        role: "Mentee",
        isApproved: true,
      }).select(
        "_id name email course division semester rollNumber mentor ern"
      );

    const groups = {};

    mentees.forEach(
      (mentee) => {
        const course =
          mentee.course?.trim() ||
          "Unknown Course";

        const division =
          mentee.division?.trim() ||
          "Unknown Division";

        const groupKey =
          `${course}-${division}`;

        if (
          !groups[groupKey]
        ) {
          groups[groupKey] = {
            course,
            division,
            students: [],
          };
        }

        groups[groupKey].students.push(
          mentee
        );
      }
    );

    return res.status(200).json({
      message:
        "Mentee groups fetched successfully",

      groups:
        Object.values(groups),
    });
  } catch (error) {
    console.error(
      "Get mentee groups error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch mentee groups",
      error: error.message,
    });
  }
};

// ======================================================
// BULK ASSIGN MENTEES
// ======================================================

const assignMentees = async (
  req,
  res
) => {
  try {
    const {
      mentorId,
      menteeIds,
    } = req.body;

    if (
      !mentorId ||
      !Array.isArray(
        menteeIds
      ) ||
      menteeIds.length === 0
    ) {
      return res.status(400).json({
        message:
          "mentorId and menteeIds are required",
      });
    }

    const mentor =
      await Auth.findOne({
        _id: mentorId,
        role: "Mentor",
        isApproved: true,
      });

    if (!mentor) {
      return res.status(404).json({
        message:
          "Approved mentor not found",
      });
    }

    const result =
      await Auth.updateMany(
        {
          _id: {
            $in: menteeIds,
          },

          role: "Mentee",

          isApproved: true,
        },
        {
          $set: {
            mentor:
              mentor._id,
          },
        }
      );

    return res.status(200).json({
      message:
        `${result.modifiedCount} mentees assigned successfully`,

      assignedCount:
        result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Assign mentees error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to assign mentees",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY MENTOR
// ======================================================

const getMyMentor = async (
  req,
  res
) => {
  try {
    const mentee =
      await Auth.findById(
        req.user.id
      );

    if (!mentee) {
      return res.status(404).json({
        message:
          "Mentee not found",
      });
    }

    if (
      mentee.role !==
      "Mentee"
    ) {
      return res.status(403).json({
        message:
          "Only mentees can access their mentor",
      });
    }

    if (!mentee.mentor) {
      return res.status(404).json({
        message:
          "No mentor assigned yet",
      });
    }

    const mentor =
      await Auth.findById(
        mentee.mentor
      ).select(
        "name email department designation employeeId qualification experience"
      );

    if (!mentor) {
      return res.status(404).json({
        message:
          "Mentor not found",
      });
    }

    return res.status(200).json({
      message:
        "Mentor fetched successfully",

      mentor,
    });
  } catch (error) {
    console.error(
      "Get my mentor error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch mentor",
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
  getMyMentees,
  assignMentee,
  rejectUser,
  removeUser,
  getMenteeGroups,
  assignMentees,
  getMyMentor,
};