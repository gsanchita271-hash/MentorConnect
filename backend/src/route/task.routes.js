import express from "express";

import verifyToken from "../middleware/auth.middlewares.js";
import { allowRoles } from "../middleware/role.middlewares.js";

import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMenteeTasks
} from "../controller/task.controllers.js";

const router = express.Router();

// Create Task
router.post("/", verifyToken, allowRoles("Mentor"), createTask);

router.get(
  "/my-tasks",
  verifyToken,
  allowRoles("Mentor"),
  getMyTasks
);

router.get(
  "/mentee-tasks",
  verifyToken,
  allowRoles("Mentee"),
  getMenteeTasks
);

router.get(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  getTaskById
);

router.patch(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  updateTask
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("Mentor"),
  deleteTask
);



export default router;