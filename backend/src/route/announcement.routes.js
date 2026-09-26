import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  createAnnouncement,
  getMyAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMenteeAnnouncements
} from "../controller/announcement.controllers.js";

const router = express.Router();

// CREATE
router.post(
  "/",
  verifyToken,
  allowRoles("Mentor"),
  createAnnouncement
);

router.get(
  "/mentee-announcements",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeAnnouncements
);

// GET ALL MY ANNOUNCEMENTS
router.get(
  "/my-announcements",
  verifyToken,
  allowRoles("Mentor"),
  getMyAnnouncements
);

// GET SINGLE
router.get(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  getAnnouncementById
);

// UPDATE
router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateAnnouncement
);

// DELETE
router.delete(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  deleteAnnouncement
);

export default router;