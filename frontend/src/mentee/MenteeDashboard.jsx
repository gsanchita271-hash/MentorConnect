import { useEffect, useState } from "react";

import {
  Users,
  CalendarDays,
  ClipboardCheck,
  Target,
  MessageSquareWarning,
  Bell,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import MentorSidebar from "../mentee/MenteeSidebar.jsx";

const API = "http://localhost:4000";

export default function MenteeDashboard() {
  const [mentee, setMentee] = useState(null);

  const [stats, setStats] = useState({
    meetings: 0,
    pendingTasks: 0,
    concerns: 0,
    announcements: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Profile
      const profileRes = await fetch(
        `${API}/api/auth/me`,
        { headers }
      );

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(
          profileData.message ||
            "Failed to fetch profile"
        );
      }

      setMentee(profileData.user);

      // Meetings
      const meetingsRes = await fetch(
        `${API}/api/meetings/my-meetings`,
        { headers }
      );

      // Tasks
      const tasksRes = await fetch(
        `${API}/api/tasks/my-tasks`,
        { headers }
      );

      // Concerns
      const concernsRes = await fetch(
        `${API}/api/concerns/my-concerns`,
        { headers }
      );

      // Announcements
      const announcementsRes = await fetch(
        `${API}/api/announcements/my-announcements`,
        { headers }
      );

      const meetingsData =
        await meetingsRes.json();

      const tasksData =
        await tasksRes.json();

      const concernsData =
        await concernsRes.json();

      const announcementsData =
        await announcementsRes.json();

      const meetings =
        meetingsData.meetings || [];

      const tasks =
        tasksData.tasks || [];

      const concerns =
        concernsData.concerns || [];

      const announcements =
        announcementsData.announcements || [];

      const now = new Date();

      const upcomingMeetings =
        meetings.filter(
          (meeting) =>
            meeting.status === "Scheduled" &&
            new Date(meeting.date) >= now
        );

      const pendingTasks =
        tasks.filter(
          (task) =>
            task.status === "Pending" ||
            task.status === "In Progress"
        );

      const openConcerns =
        concerns.filter(
          (concern) =>
            concern.status === "Pending" ||
            concern.status === "In Review"
        );

      setStats({
        meetings: upcomingMeetings.length,
        pendingTasks: pendingTasks.length,
        concerns: openConcerns.length,
        announcements: announcements.length,
      });
    } catch (error) {
      console.error(
        "Mentee dashboard error:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* 
        Later we will create a separate MenteeSidebar.
        For now this keeps the same layout structure.
      */}
      <MentorSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">

        <div className="p-5 sm:p-7 lg:p-10">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="mb-2 text-sm font-medium text-blue-400">
                Mentee Portal
              </p>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Welcome back,{" "}
                {mentee?.name || "Mentee"} 👋
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Track your academic progress,
                meetings, tasks and mentoring activities.
              </p>

              {mentee && (
                <div className="mt-4 flex flex-wrap gap-2">

                  {mentee.course && (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                      {mentee.course}
                    </span>
                  )}

                  {mentee.semester && (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                      Semester {mentee.semester}
                    </span>
                  )}

                  {mentee.rollNumber && (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                      Roll No. {mentee.rollNumber}
                    </span>
                  )}

                </div>
              )}

            </div>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* OVERVIEW */}
          <section className="mb-10">

            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your mentoring activity at a glance
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

              <OverviewCard
                title="Upcoming Meetings"
                value={
                  loading
                    ? "..."
                    : stats.meetings
                }
                icon={CalendarDays}
              />

              <OverviewCard
                title="Pending Tasks"
                value={
                  loading
                    ? "..."
                    : stats.pendingTasks
                }
                icon={Target}
              />

              <OverviewCard
                title="Open Concerns"
                value={
                  loading
                    ? "..."
                    : stats.concerns
                }
                icon={MessageSquareWarning}
              />

              <OverviewCard
                title="Announcements"
                value={
                  loading
                    ? "..."
                    : stats.announcements
                }
                icon={Bell}
              />

            </div>

          </section>

          {/* QUICK ACCESS */}
          <section className="mb-10">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                Quick Access
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Quickly access your mentoring tools
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <QuickCard
                title="My Mentor"
                description="View your assigned mentor"
                icon={Users}
                path="/mentee/mentor"
                onClick={handleNavigate}
              />

              <QuickCard
                title="Meetings"
                description="View your upcoming meetings"
                icon={CalendarDays}
                path="/mentee/meetings"
                onClick={handleNavigate}
              />

              <QuickCard
                title="Attendance"
                description="Check your attendance history"
                icon={ClipboardCheck}
                path="/mentee/attendance"
                onClick={handleNavigate}
              />

              <QuickCard
                title="Tasks & Goals"
                description="Track your assigned tasks"
                icon={Target}
                path="/mentee/tasks"
                onClick={handleNavigate}
              />

              <QuickCard
                title="Concerns"
                description="Raise and track concerns"
                icon={MessageSquareWarning}
                path="/mentee/concerns"
                onClick={handleNavigate}
              />

              <QuickCard
                title="Announcements"
                description="Read mentor announcements"
                icon={Bell}
                path="/mentee/announcements"
                onClick={handleNavigate}
              />

              <QuickCard
                title="Academic Progress"
                description="Track your academic performance"
                icon={BookOpen}
                path="/mentee/academic"
                onClick={handleNavigate}
              />

            </div>

          </section>

          {/* EMPTY ACTIVITY */}
          <section>

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest mentoring activities
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025]">

              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                  <ClockIcon />
                </div>

                <h3 className="text-sm font-semibold">
                  No recent activity
                </h3>

                <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Your meetings, tasks, attendance
                  and announcements will appear here.
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


/* =========================
   OVERVIEW CARD
========================= */

function OverviewCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-500/20">

      <div className="mb-5 flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

          <Icon
            size={19}
            className="text-blue-400"
          />

        </div>

        <span className="text-2xl font-bold">
          {value}
        </span>

      </div>

      <p className="text-sm font-medium text-slate-300">
        {title}
      </p>

    </div>
  );
}


/* =========================
   QUICK CARD
========================= */

function QuickCard({
  title,
  description,
  icon: Icon,
  path,
  onClick,
}) {
  return (
    <button
      onClick={() => onClick(path)}
      className="group text-left"
    >

      <div className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.04]">

        <div className="mb-5 flex items-center justify-between">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10">

            <Icon
              size={21}
              className="text-blue-400"
            />

          </div>

          <ArrowRight
            size={18}
            className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
          />

        </div>

        <h3 className="mb-2 text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </button>
  );
}


/* =========================
   CLOCK ICON
========================= */

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-500"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
      />

      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}