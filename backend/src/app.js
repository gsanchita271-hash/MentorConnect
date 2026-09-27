import { connectDB } from './db/index.js'
import express from 'express'
import dotenv from 'dotenv'
import meetingRoutes from './route/meeting.routes.js'
import authRoutes from "./route/auth.routes.js"
import attendanceRoutes from './route/attendance.routes.js'
import taskRoutes from './route/task.routes.js'
import concernRoutes from "./route/concern.routes.js"
import announcementRoutes from './route/announcement.routes.js'
import academicRoutes from './route/academic.routes.js'
import cors from 'cors'
dotenv.config({
    path: './.env'
})
const app = express()
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mentor-connect-wheat.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json())
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/attendance", attendanceRoutes)
app.use("/api/tasks", taskRoutes);
app.use("/api/concerns", concernRoutes);
app.use(
  "/api/announcements",
  announcementRoutes
);
app.use(
  "/api/academic",
  academicRoutes
);

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running at http://localhost:${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log(err);
})
