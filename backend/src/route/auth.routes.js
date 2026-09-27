import { Router } from "express";

import {
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
} from "../controller/auth.contollers.js";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

const router = Router();

// ======================================================
// AUTH
// ======================================================

router.post("/register", registerUser);

router.post("/login", loginUser);

// ======================================================
// ADMIN - USER APPROVAL
// ======================================================

// Approve pending Mentor/Mentee
router.patch(
  "/approve/:id",
  verifyToken,
  allowRoles("Admin"),
  approveUser
);

// Get pending registrations
router.get(
  "/pending",
  verifyToken,
  allowRoles("Admin"),
  getPendingUsers
);

// Get all Mentor + Mentee users
router.get(
  "/users",
  verifyToken,
  allowRoles("Admin"),
  getAllUsers
);

// Edit Mentor/Mentee by Admin
router.patch(
  "/users/:id",
  verifyToken,
  allowRoles("Admin"),
  updateUserByAdmin
);

// Reject pending user
router.patch(
  "/reject/:id",
  verifyToken,
  allowRoles("Admin"),
  rejectUser
);

// Remove approved user
router.delete(
  "/users/:id",
  verifyToken,
  allowRoles("Admin"),
  removeUser
);

// ======================================================
// ADMIN - MENTEE ASSIGNMENT
// ======================================================

// Assign one mentee
router.patch(
  "/assign-mentee",
  verifyToken,
  allowRoles("Admin"),
  assignMentee
);

// Get Course + Division groups
router.get(
  "/mentee-groups",
  verifyToken,
  allowRoles("Admin"),
  getMenteeGroups
);

// Assign multiple mentees
router.patch(
  "/assign-mentees",
  verifyToken,
  allowRoles("Admin"),
  assignMentees
);

// ======================================================
// PROFILE
// ======================================================

// Mentor + Mentee + Admin can view own profile
router.get(
  "/me",
  verifyToken,
  getMyProfile
);

// Mentor + Mentee can update own profile
router.patch(
  "/me",
  verifyToken,
  allowRoles("Mentor", "Mentee"),
  updateMyProfile
);

// ======================================================
// MENTOR
// ======================================================

// Get logged-in mentor's mentees
router.get(
  "/my-mentees",
  verifyToken,
  allowRoles("Mentor"),
  getMyMentees
);

// ======================================================
// MENTEE
// ======================================================

// Get logged-in mentee's mentor
router.get(
  "/my-mentor",
  verifyToken,
  allowRoles("Mentee"),
  getMyMentor
);

// ======================================================
// TEST PROTECTED ROUTE
// ======================================================

router.get(
  "/protected",
  verifyToken,
  (req, res) => {
    res.status(200).json({
      message: "You are authenticated",
      user: req.user,
    });
  }
);

export default router;