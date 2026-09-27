import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMenteeTasks,
} from "../controller/task.controllers.js";

const router = express.Router();


// ==========================================
// CREATE TASK
// Only Mentor can create a task
// ==========================================

router.post(
  "/",
  verifyToken,
  allowRoles("Mentor"),
  createTask
);


// ==========================================
// MENTOR TASKS
// Mentor can see their own tasks
// ==========================================

router.get(
  "/my-tasks",
  verifyToken,
  allowRoles("Mentor"),
  getMyTasks
);


// ==========================================
// MENTEE TASKS
// Mentee can see tasks assigned to them
// ==========================================

router.get(
  "/mentee-tasks",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeTasks
);


// ==========================================
// GET TASK BY ID
// Only Mentor can access
// ==========================================

router.get(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  getTaskById
);


// ==========================================
// UPDATE TASK
// Only Mentor can update
// ==========================================

router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateTask
);


// ==========================================
// DELETE TASK
// Only Mentor can delete
// ==========================================

router.delete(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  deleteTask
);


export default router;