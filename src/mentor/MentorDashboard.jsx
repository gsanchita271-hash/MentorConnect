import { useEffect, useState } from "react";

import {
  Users,
  CalendarDays,
  ClipboardCheck,
  Target,
  MessageSquareWarning,
  Bell,
  BookOpen,
  FileText,
  ArrowRight,
  Clock,
  RefreshCw,
} from "lucide-react";

import MentorSidebar from "../components/layout/MentorSidebar.jsx";

const API = import.meta.env.VITE_API_URL;

const shortcuts = [
  {
    title: "My Mentees",
    description: "View and manage your assigned mentees",
    icon: Users,
    path: "/mentor/mentees",
  },
  {
    title: "Meetings",
    description: "Schedule and manage mentor meetings",
    icon: CalendarDays,
    path: "/mentor/meetings",
  },
  {
    title: "Attendance",
    description: "Track mentee attendance",
    icon: ClipboardCheck,
    path: "/mentor/attendance",
  },
  {
    title: "Tasks & Goals",
    description: "Create and manage mentee tasks",
    icon: Target,
    path: "/mentor/tasks",
  },
  {
    title: "Concerns",
    description: "Review mentee concerns and complaints",
    icon: MessageSquareWarning,
    path: "/mentor/concerns",
  },
  {
    title: "Announcements",
    description: "Share updates with your mentees",
    icon: Bell,
    path: "/mentor/announcements",
  },
  {
    title: "Academic Progress",
    description: "Track academic performance",
    icon: BookOpen,
    path: "/mentor/academic",
  },
  {
    title: "Feedback & Reports",
    description: "View feedback and generate reports",
    icon: FileText,
    path: "/mentor/reports",
  },
];

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);

  const [stats, setStats] = useState({
    mentees: 0,
    meetings: 0,
    pendingTasks: 0,
    openConcerns: 0,
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

      const [
        profileRes,
        menteesRes,
        meetingsRes,
        tasksRes,
        concernsRes,
      ] = await Promise.all([
        // FIXED: /api removed because API already contains /api
        fetch(`${API}/auth/me`, {
          headers,
        }),

        fetch(`${API}/auth/my-mentees`, {
          headers,
        }),

        fetch(`${API}/meetings/my-meetings`, {
          headers,
        }),

        fetch(`${API}/tasks/my-tasks`, {
          headers,
        }),

        fetch(`${API}/concerns/mentor-concerns`, {
          headers,
        }),
      ]);

      const profileData = await profileRes.json();
      const menteesData = await menteesRes.json();
      const meetingsData = await meetingsRes.json();
      const tasksData = await tasksRes.json();
      const concernsData = await concernsRes.json();

      /* =========================
         PROFILE
      ========================= */

      if (profileRes.ok) {
        setMentor(profileData.user);
      }

      /* =========================
         CHECK API RESPONSES
      ========================= */

      if (!menteesRes.ok) {
        throw new Error(
          menteesData.message || "Failed to fetch mentees"
        );
      }

      if (!meetingsRes.ok) {
        throw new Error(
          meetingsData.message || "Failed to fetch meetings"
        );
      }

      if (!tasksRes.ok) {
        throw new Error(
          tasksData.message || "Failed to fetch tasks"
        );
      }

      if (!concernsRes.ok) {
        throw new Error(
          concernsData.message || "Failed to fetch concerns"
        );
      }

      /* =========================
         DATA
      ========================= */

      const mentees = menteesData.mentees || [];

      const meetings = meetingsData.meetings || [];

      const tasks = tasksData.tasks || [];

      const concerns = concernsData.concerns || [];

      const now = new Date();

      /* =========================
         UPCOMING MEETINGS
      ========================= */

      const upcomingMeetings = meetings.filter(
        (meeting) =>
          meeting.status === "Scheduled" &&
          new Date(meeting.date) >= now
      );

      /* =========================
         PENDING TASKS
      ========================= */

      const pendingTasks = tasks.filter(
        (task) =>
          task.status === "Pending" ||
          task.status === "In Progress"
      );

      /* =========================
         OPEN CONCERNS
      ========================= */

      const openConcerns = concerns.filter(
        (concern) =>
          concern.status === "Pending" ||
          concern.status === "In Review"
      );

      /* =========================
         SET STATS
      ========================= */

      setStats({
        mentees: mentees.length,
        meetings: upcomingMeetings.length,
        pendingTasks: pendingTasks.length,
        openConcerns: openConcerns.length,
      });
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShortcut = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <MentorSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="p-5 sm:p-7 lg:p-10">

          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="mb-2 text-sm font-medium text-blue-400">
                Mentor Portal
              </p>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Welcome back,{" "}
                {mentor?.name || "Mentor"} 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Manage your mentees, meetings, tasks
                and mentoring activities from one place.
              </p>

              {/* Mentor information */}
              {mentor && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {mentor.designation && (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                      {mentor.designation}
                    </span>
                  )}

                  {mentor.department && (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                      {mentor.department}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* REFRESH */}
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

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* =========================
              OVERVIEW
          ========================= */}

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
                title="Total Mentees"
                value={
                  loading
                    ? "..."
                    : stats.mentees
                }
                icon={Users}
              />

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
                    : stats.openConcerns
                }
                icon={MessageSquareWarning}
              />

            </div>
          </section>

          {/* =========================
              QUICK SHORTCUTS
          ========================= */}

          <section className="mb-10">

            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Quick Shortcuts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Quickly access your mentoring tools
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;

                return (
                  <button
                    key={shortcut.title}
                    onClick={() =>
                      handleShortcut(
                        shortcut.path
                      )
                    }
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
                        {shortcut.title}
                      </h3>

                      <p className="text-xs leading-5 text-slate-500">
                        {shortcut.description}
                      </p>

                    </div>
                  </button>
                );
              })}

            </div>
          </section>

          {/* =========================
              RECENT ACTIVITY
          ========================= */}

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
                  <Clock
                    size={22}
                    className="text-slate-500"
                  />
                </div>

                <h3 className="text-sm font-semibold">
                  No recent activity
                </h3>

                <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Your meetings, tasks, attendance
                  and other activities will appear
                  here.
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