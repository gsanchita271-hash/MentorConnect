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
  getMenteeConcerns,
} from "../controller/concern.controllers.js";

const router = express.Router();


// =========================================================
// MENTEE ROUTES
// =========================================================

// Submit a new concern
// Only Mentee can create a concern

router.post(
  "/",
  verifyToken,
  allowRoles("Mentee"),
  createConcern
);


// Get logged-in Mentee's own concerns
// Mentee Dashboard should use this route

router.get(
  "/my-concerns",
  verifyToken,
  allowRoles("Mentee"),
  getMyConcerns
);


// Get Mentee concerns
// Only use this if your controller/frontend specifically needs
// this separate endpoint

router.get(
  "/mentee-concerns",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeConcerns
);


// =========================================================
// MENTOR ROUTES
// =========================================================

// Get concerns from assigned Mentees

router.get(
  "/mentor-concerns",
  verifyToken,
  allowRoles("Mentor"),
  getMentorConcerns
);


// Get single concern
// Only Mentor can access

router.get(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  getConcernById
);


// Update concern
// Only Mentor can update

router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateConcern
);


// Delete concern
// Only Mentor can delete

router.delete(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  deleteConcern
);


export default router;