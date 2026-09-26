import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  markAttendance,
  getMyAttendance,
  updateAttendance,
  getMenteeAttendanceHistory,
  getMenteeAttendance
} from "../controller/attendance.controllers.js";

const router = express.Router();

// Mark Attendance
router.post(
  "/",
  verifyToken,
  allowRoles("Mentor"),
  markAttendance
);

// Update Attendance
router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateAttendance
);

// Get Mentor's Attendance
router.get(
  "/my-attendance",
  verifyToken,
  allowRoles("Mentor"),
  getMyAttendance
);

router.get(
  "/history/:menteeId",
  verifyToken,
  allowRoles("Mentor"),
  getMenteeAttendanceHistory
);

router.get(
  "/mentee-attendance",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeAttendance
);

export default router;