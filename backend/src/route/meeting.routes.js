import express from "express";
import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  createMeeting,
  getMyMeetings,
  getMenteeMeetings
} from "../controller/meeting.controllers.js";

const router = express.Router();


// Schedule a meeting
router.post(
  "/",
  verifyToken,
  allowRoles("Mentor"),
  createMeeting
);


// Get mentor's meetings
router.get(
  "/my-meetings",
  verifyToken,
  allowRoles("Mentor"),
  getMyMeetings
);

router.get(
  "/mentee-meetings",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeMeetings
);

export default router;