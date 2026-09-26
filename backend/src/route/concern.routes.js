import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  createConcern,
  getMyConcerns,
  getMentorConcerns,
  getConcernById,
  updateConcern,
  deleteConcern,
  getMenteeConcerns
} from "../controller/concern.controllers.js";

const router = express.Router();

// =========================================================
// MENTEE ROUTES
// =========================================================

// Submit a new concern
router.post(
  "/",
  verifyToken,
  allowRoles("Mentee"),
  createConcern
);

// Get logged-in mentee's concerns
router.get(
  "/my-concerns",
  verifyToken,
  allowRoles("Mentee"),
  getMyConcerns
);

router.get(
  "/mentee-concerns",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeConcerns
);

// =========================================================
// MENTOR ROUTES
// =========================================================

// Get concerns from assigned mentees
router.get(
  "/mentor-concerns",
  verifyToken,
  allowRoles("Mentor"),
  getMentorConcerns
);

// Get single concern
router.get(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  getConcernById
);

// Update concern
router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateConcern
);

// Delete concern
router.delete(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  deleteConcern
);



export default router;