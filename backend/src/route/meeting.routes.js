import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  createMeeting,
  getMyMeetings,
  getMenteeMeetings,
} from "../controller/meeting.controllers.js";

const router = express.Router();


// ==========================================
// CREATE MEETING
// Only Mentor can create/schedule a meeting
// ==========================================

router.post(
  "/",
  verifyToken,
  allowRoles("Mentor"),
  createMeeting
);


// ==========================================
// MENTOR MEETINGS
// Mentor can see meetings created by them
// ==========================================

router.get(
  "/my-meetings",
  verifyToken,
  allowRoles("Mentor"),
  getMyMeetings
);


// ==========================================
// MENTEE MEETINGS
// Mentee can see meetings assigned to them
// ==========================================

router.get(
  "/mentee-meetings",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeMeetings
);


export default router;