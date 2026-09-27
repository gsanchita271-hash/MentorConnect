import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  createAnnouncement,
  getMyAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMenteeAnnouncements,
} from "../controller/announcement.controllers.js";

const router = express.Router();


// =========================================================
// CREATE ANNOUNCEMENT
// Only Mentor can create announcements
// =========================================================

router.post(
  "/",
  verifyToken,
  allowRoles("Mentor"),
  createAnnouncement
);


// =========================================================
// MENTEE ANNOUNCEMENTS
// Mentee can see announcements
// =========================================================

router.get(
  "/mentee-announcements",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeAnnouncements
);


// =========================================================
// MENTOR ANNOUNCEMENTS
// Mentor can see their own announcements
// =========================================================

router.get(
  "/my-announcements",
  verifyToken,
  allowRoles("Mentor"),
  getMyAnnouncements
);


// =========================================================
// GET SINGLE ANNOUNCEMENT
// Only Mentor can access
// =========================================================

router.get(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  getAnnouncementById
);


// =========================================================
// UPDATE ANNOUNCEMENT
// Only Mentor can update
// =========================================================

router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateAnnouncement
);


// =========================================================
// DELETE ANNOUNCEMENT
// Only Mentor can delete
// =========================================================

router.delete(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  deleteAnnouncement
);


export default router;