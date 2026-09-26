import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";
import upload from "../middleware/upload.middlewares.js";

import {
  createAcademic,
  getMyAcademic,
  getMenteeAcademic,
  getMyMenteeAcademic,
  updateAcademic,
  deleteAcademic,
  uploadResult,
  confirmOCRResult,
} from "../controller/academic.controllers.js";

const router = express.Router();

/* =========================================
   MENTOR ACADEMIC
========================================= */

// Create academic record manually
router.post(
  "/",
  verifyToken,
  allowRoles("Mentor"),
  createAcademic
);

// Get all academic records of mentor's mentees
router.get(
  "/my-academic",
  verifyToken,
  allowRoles("Mentor"),
  getMyAcademic
);

// Get academic record of one mentee
router.get(
  "/mentee/:menteeId",
  verifyToken,
  allowRoles("Mentor"),
  getMenteeAcademic
);

/* =========================================
   MENTEE ACADEMIC
========================================= */

// Get logged-in mentee's academic records
router.get(
  "/mentee-academic",
  verifyToken,
  allowRoles("Mentee"),
  getMyMenteeAcademic
);

/* =========================================
   OCR RESULT UPLOAD
========================================= */

// Upload university result
router.post(
  "/upload-result",
  verifyToken,
  allowRoles("Mentor"),
  upload.single("result"),
  uploadResult
);

// Confirm edited OCR result and save to MongoDB
router.post(
  "/confirm-result",
  verifyToken,
  allowRoles("Mentor"),
  confirmOCRResult
);

/* =========================================
   UPDATE / DELETE
========================================= */

router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateAcademic
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  deleteAcademic
);

export default router;