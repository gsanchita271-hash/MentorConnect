import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./admin/AdminDashboard";

// =========================
// MENTOR
// =========================

import MentorDashboard from "./mentor/MentorDashboard";
import MentorMentees from "./mentor/MentorMentees";
import MentorMeetings from "./mentor/MentorMeetings";
import MentorAttendance from "./mentor/MentorAttendance";
import MentorTasks from "./mentor/MentorTasks";
import MentorConcerns from "./mentor/MentorConcerns";
import MentorAnnouncements from "./mentor/MentorAnnouncement";
import MentorProfile from "./mentor/MentorProfile";
import MentorAcademic from "./mentor/MentorAcademic";

// =========================
// MENTEE
// =========================

import MenteeDashboard from "./mentee/MenteeDashboard";
import MyMentor from "./mentee/MyMentor";
import MenteeMeetings from "./mentee/MenteeMeetings";
import MenteeAttendance from "./mentee/MenteeAttendance";
import MenteeTasks from "./mentee/MenteeTasks";
import MenteeConcerns from "./mentee/MenteeConcerns";
import MenteeAnnouncements from "./mentee/MenteeAnnouncement";
import MenteeAcademic from "./mentee/MenteeAcademic";
import MenteeProfile from "./mentee/MenteeProfile";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC PAGES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />


        {/* =========================
            MENTOR
        ========================= */}

        <Route
          path="/mentor/dashboard"
          element={<MentorDashboard />}
        />

        <Route
          path="/mentor/mentees"
          element={<MentorMentees />}
        />

        <Route
          path="/mentor/meetings"
          element={<MentorMeetings />}
        />

        <Route
          path="/mentor/attendance"
          element={<MentorAttendance />}
        />

        <Route
          path="/mentor/tasks"
          element={<MentorTasks />}
        />

        <Route
          path="/mentor/concerns"
          element={<MentorConcerns />}
        />

        <Route
          path="/mentor/announcements"
          element={<MentorAnnouncements />}
        />

        <Route
          path="/mentor/academic"
          element={<MentorAcademic />}
        />

        <Route
          path="/mentor/profile"
          element={<MentorProfile />}
        />


        {/* =========================
            MENTEE
        ========================= */}

        <Route
          path="/mentee/dashboard"
          element={<MenteeDashboard />}
        />

        <Route
          path="/mentee/mentor"
          element={<MyMentor />}
        />

        <Route
          path="/mentee/meetings"
          element={<MenteeMeetings />}
        />

        <Route
          path="/mentee/attendance"
          element={<MenteeAttendance />}
        />

        <Route
          path="/mentee/tasks"
          element={<MenteeTasks />}
        />

        <Route
          path="/mentee/concerns"
          element={<MenteeConcerns />}
        />

        <Route
          path="/mentee/announcements"
          element={<MenteeAnnouncements />}
        />

        <Route
          path="/mentee/academic"
          element={<MenteeAcademic />}
        />

        <Route
          path="/mentee/profile"
          element={<MenteeProfile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;