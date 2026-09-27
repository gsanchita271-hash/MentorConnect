import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Video,
  User,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MenteeSidebar from "./MenteeSidebar.jsx";

const API = import.meta.env.VITE_API_URL;

export default function MenteeMeetings() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `${API}/meetings/mentee-meetings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch meetings"
        );
      }

      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("Mentee meetings error:", error);

      setError(
        error.message || "Failed to load meetings"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <MenteeSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">

        <div className="p-5 sm:p-7 lg:p-10">

          {/* Header */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <button
                onClick={() =>
                  navigate("/mentee/dashboard")
                }
                className="mb-4 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>

              <p className="mb-2 text-sm font-medium text-blue-400">
                Mentee Portal
              </p>

              <h1 className="text-2xl font-bold sm:text-3xl">
                My Meetings
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                View your scheduled mentoring meetings.
              </p>

            </div>

            <button
              onClick={fetchMeetings}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-slate-500">
              Loading meetings...
            </div>
          ) : meetings.length === 0 ? (

            /* Empty */

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                <CalendarDays
                  size={25}
                  className="text-slate-500"
                />
              </div>

              <h3 className="text-sm font-semibold">
                No meetings scheduled
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                Your mentor's scheduled meetings will
                appear here.
              </p>

            </div>

          ) : (

            /* Meetings */

            <div className="grid gap-4 lg:grid-cols-2">

              {meetings.map((meeting) => (

                <div
                  key={meeting._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-500/20"
                >

                  {/* Title */}

                  <div className="mb-5 flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-base font-semibold">
                        {meeting.title}
                      </h2>

                      <span className="mt-2 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                        {meeting.status}
                      </span>

                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <CalendarDays
                        size={19}
                        className="text-blue-400"
                      />
                    </div>

                  </div>

                  {/* Date & Time */}

                  <div className="mb-5 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">

                      <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <CalendarDays size={15} />
                        <span className="text-xs">
                          Date
                        </span>
                      </div>

                      <p className="text-sm text-slate-200">
                        {formatDate(meeting.date)}
                      </p>

                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">

                      <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <Clock size={15} />
                        <span className="text-xs">
                          Time
                        </span>
                      </div>

                      <p className="text-sm text-slate-200">
                        {formatTime(meeting.date)}
                      </p>

                    </div>

                  </div>

                  {/* Mentor */}

                  {meeting.mentor && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                        <User
                          size={17}
                          className="text-slate-400"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Mentor
                        </p>

                        <p className="text-sm font-medium text-slate-200">
                          {meeting.mentor.name}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* Agenda */}

                  {meeting.agenda && (
                    <div className="mb-5">

                      <p className="mb-1 text-xs text-slate-500">
                        Agenda
                      </p>

                      <p className="text-sm leading-6 text-slate-300">
                        {meeting.agenda}
                      </p>

                    </div>
                  )}

                  {/* Meeting Link */}

                  {meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                      <Video size={16} />
                      Join Meeting
                      <ExternalLink size={14} />
                    </a>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}