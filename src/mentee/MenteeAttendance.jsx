import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MenteeSidebar from "./MenteeSidebar.jsx";

const API = import.meta.env.VITE_API_URL;

const MenteeAttendance = () => {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API}/attendance/mentee-attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch attendance"
        );
      }

      setAttendance(data.attendance || []);

      setSummary(
        data.summary || {
          total: 0,
          present: 0,
          absent: 0,
          percentage: 0,
        }
      );
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <MenteeSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-sm text-slate-500">
                Mentee Portal
              </p>

              <h1 className="text-2xl font-semibold">
                My Attendance
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track your attendance and class history.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/mentee/dashboard")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>

              <button
                onClick={fetchAttendance}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <CalendarDays size={20} />
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Total Classes
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.total}
              </p>
            </div>

            {/* Present */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Present
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.present}
              </p>
            </div>

            {/* Absent */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                  <XCircle size={20} />
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Absent
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.absent}
              </p>
            </div>

            {/* Percentage */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{
                      width: `${Math.min(
                        summary.percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Attendance Percentage
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.percentage}%
              </p>
            </div>
          </div>

          {/* Attendance History */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025]">

            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-medium">
                Attendance History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your attendance records
              </p>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Loading attendance...
              </div>
            ) : attendance.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CalendarDays
                  size={36}
                  className="mx-auto mb-3 text-slate-600"
                />

                <p className="text-sm text-slate-400">
                  No attendance records found.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {attendance.map((record) => (
                  <div
                    key={record._id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(
                          record.date
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      {record.mentor && (
                        <p className="mt-1 text-xs text-slate-500">
                          Mentor: {record.mentor.name}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                        record.status === "Present"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {record.status === "Present" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}

                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default MenteeAttendance;