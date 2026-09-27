import { useEffect, useState } from "react";
import {
  Bell,
  RefreshCw,
  ArrowLeft,
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MenteeSidebar from "./MenteeSidebar.jsx";

const API = "http://localhost:4000";

const MenteeAnnouncements = () => {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API}/api/announcements/mentee-announcements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch announcements"
        );
      }

      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error("Announcements error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getPriorityStyle = (priority) => {
    if (priority === "Urgent") {
      return {
        className:
          "border-red-500/20 bg-red-500/10 text-red-400",
        icon: <AlertTriangle size={14} />,
      };
    }

    if (priority === "Important") {
      return {
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        icon: <AlertTriangle size={14} />,
      };
    }

    return {
      className:
        "border-blue-500/20 bg-blue-500/10 text-blue-400",
      icon: <CheckCircle2 size={14} />,
    };
  };

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <MenteeSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Bell size={24} />
                </div>

                <div>
                  <h1 className="text-2xl font-semibold">
                    Announcements
                  </h1>

                  <p className="text-sm text-slate-500">
                    Important updates from your mentor
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/mentee/dashboard")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06]"
              >
                <ArrowLeft size={17} />
                Dashboard
              </button>

              <button
                onClick={fetchAnnouncements}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-sm text-slate-500">
                Total Announcements
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {announcements.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-sm text-slate-500">
                Important
              </p>

              <p className="mt-2 text-2xl font-semibold text-yellow-400">
                {
                  announcements.filter(
                    (item) => item.priority === "Important"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-sm text-slate-500">
                Urgent
              </p>

              <p className="mt-2 text-2xl font-semibold text-red-400">
                {
                  announcements.filter(
                    (item) => item.priority === "Urgent"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <RefreshCw
                size={28}
                className="animate-spin text-blue-400"
              />
            </div>
          ) : announcements.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] px-6 text-center">
              <div className="mb-4 rounded-2xl bg-blue-500/10 p-4 text-blue-400">
                <Bell size={32} />
              </div>

              <h2 className="text-lg font-semibold">
                No announcements yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Your mentor's announcements and important updates
                will appear here.
              </p>
            </div>
          ) : (
            /* Announcement List */
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const priorityStyle = getPriorityStyle(
                  announcement.priority
                );

                return (
                  <div
                    key={announcement._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20"
                  >
                    <div className="flex flex-col gap-4">

                      {/* Top */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {announcement.title}
                          </h2>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Clock3 size={14} />
                              {formatDate(
                                announcement.publishDate
                              )}
                              {" • "}
                              {formatTime(
                                announcement.publishDate
                              )}
                            </span>

                            {announcement.mentor?.name && (
                              <span>
                                By {announcement.mentor.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${priorityStyle.className}`}
                        >
                          {priorityStyle.icon}
                          {announcement.priority}
                        </span>
                      </div>

                      {/* Message */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {announcement.message}
                        </p>
                      </div>

                      {/* Mentor Info */}
                      {announcement.mentor && (
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          {announcement.mentor.department && (
                            <span>
                              Department:{" "}
                              <span className="text-slate-300">
                                {announcement.mentor.department}
                              </span>
                            </span>
                          )}

                          {announcement.mentor.designation && (
                            <span>
                              Designation:{" "}
                              <span className="text-slate-300">
                                {announcement.mentor.designation}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MenteeAnnouncements;