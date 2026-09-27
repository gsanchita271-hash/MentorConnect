import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./db/index.js";

import meetingRoutes from "./route/meeting.routes.js";
import authRoutes from "./route/auth.routes.js";
import attendanceRoutes from "./route/attendance.routes.js";
import taskRoutes from "./route/task.routes.js";
import concernRoutes from "./route/concern.routes.js";
import announcementRoutes from "./route/announcement.routes.js";
import academicRoutes from "./route/academic.routes.js";

// =========================
// LOAD ENVIRONMENT VARIABLES
// =========================

dotenv.config({
  path: "./.env",
});

const app = express();

// =========================
// CORS
// =========================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mentor-connect-wheat.vercel.app/",
      
    ],
    credentials: true,
  })
);

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);

app.use("/api/meetings", meetingRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/concerns", concernRoutes);

app.use("/api/announcements", announcementRoutes);

app.use("/api/academic", academicRoutes);

// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "MentorConnect backend is running",
  });
});

// =========================
// DATABASE + SERVER
// =========================

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "MongoDB connection failed:",
      err
    );
  });