import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardCheck,
  Search,
  Pencil,
  X,
  Save,
  History,
} from "lucide-react";

import MentorSidebar from "../components/layout/MentorSidebar.jsx";

const API = "http://localhost:4000";

const MentorAttendance = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mentees, setMentees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyMentee, setHistoryMentee] = useState(null);

  const token = sessionStorage.getItem("token");

  // =========================
  // FETCH DATA
  // =========================

  const fetchMentees = async () => {
    try {
      const response = await fetch(
        `${API}/api/auth/my-mentees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch mentees");
      }

      setMentees(data.mentees || []);
    } catch (error) {
      console.error("Fetch mentees error:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);

      const response = await fetch(
        `${API}/api/attendance/my-attendance`,
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
    } catch (error) {
      console.error("Fetch attendance error:", error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchMentees(),
        fetchAttendance(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =========================
  // ATTENDANCE FOR SELECTED DATE
  // =========================

  const getAttendanceRecord = (menteeId) => {
    return attendance.find(
      (record) =>
        record.mentee?._id === menteeId &&
        new Date(record.date).toISOString().split("T")[0] ===
          selectedDate
    );
  };

  // =========================
  // MARK ATTENDANCE
  // =========================

  const handleMarkAttendance = async (menteeId, status) => {
    try {
      const response = await fetch(
        `${API}/api/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            menteeId,
            date: selectedDate,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to mark attendance");
        return;
      }

      await fetchAttendance();
    } catch (error) {
      console.error("Mark attendance error:", error);
      alert("Something went wrong");
    }
  };

  // =========================
  // EDIT ATTENDANCE
  // =========================

  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditOpen(true);
  };

  const handleUpdateAttendance = async () => {
    if (!editingRecord || !editStatus) return;

    try {
      setSavingEdit(true);

      const response = await fetch(
        `${API}/api/attendance/${editingRecord._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: editStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update attendance");
        return;
      }

      setEditOpen(false);
      setEditingRecord(null);
      setEditStatus("");

      await fetchAttendance();
    } catch (error) {
      console.error("Update attendance error:", error);
      alert("Something went wrong");
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================
  // HISTORY
  // =========================

  const handleViewHistory = async (mentee) => {
    try {
      setHistoryOpen(true);
      setHistoryLoading(true);
      setHistoryMentee(mentee);
      setAttendanceHistory([]);

      const response = await fetch(
        `${API}/api/attendance/history/${mentee._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch attendance history"
        );
      }

      setAttendanceHistory(data.history || []);
    } catch (error) {
      console.error("History error:", error);
      alert(error.message || "Failed to fetch history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setHistoryMentee(null);
    setAttendanceHistory([]);
  };

  // =========================
  // SEARCH
  // =========================

  const filteredMentees = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return mentees;

    return mentees.filter((mentee) =>
      [
        mentee.name,
        mentee.email,
        mentee.course,
        mentee.division,
        mentee.rollNumber,
      ]
        .filter(Boolean)
        .some((field) =>
          field.toString().toLowerCase().includes(value)
        )
    );
  }, [mentees, search]);

  // =========================
  // STATS
  // =========================

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let notMarked = 0;

    mentees.forEach((mentee) => {
      const record = getAttendanceRecord(mentee._id);

      if (!record) {
        notMarked++;
      } else if (record.status === "Present") {
        present++;
      } else if (record.status === "Absent") {
        absent++;
      }
    });

    return {
      total: mentees.length,
      present,
      absent,
      notMarked,
    };
  }, [mentees, attendance, selectedDate]);

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816]">
        <Loader2
          size={32}
          className="animate-spin text-blue-400"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* Sidebar */}
      <MentorSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main */}
      <main
        className={`
          min-h-screen
          w-full
          transition-all
          duration-300
          ${
            sidebarCollapsed
              ? "md:ml-20 md:w-[calc(100%-5rem)]"
              : "md:ml-64 md:w-[calc(100%-16rem)]"
          }
        `}
      >
        {/* Header */}
        <header className="border-b border-white/10 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <ClipboardCheck size={22} />
                </div>

                <div>
                  <h1 className="text-xl font-semibold sm:text-2xl">
                    Attendance
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage mentee attendance records
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <Calendar
                size={18}
                className="text-blue-400"
              />

              <div>
                <p className="text-[11px] text-slate-500">
                  Attendance Date
                </p>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  className="mt-1 bg-transparent text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Total */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Total Mentees
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {stats.total}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Users size={20} />
                </div>
              </div>
            </div>

            {/* Present */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Present
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-400">
                    {stats.present}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            {/* Absent */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Absent
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-red-400">
                    {stats.absent}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <XCircle size={20} />
                </div>
              </div>
            </div>

            {/* Not Marked */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Not Marked
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-yellow-400">
                    {stats.notMarked}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Calendar size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search mentee..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <p className="text-sm text-slate-500">
              {filteredMentees.length} mentee
              {filteredMentees.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Attendance */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Mentee
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Course
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Division
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Roll No.
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMentees.map((mentee) => {
                    const record = getAttendanceRecord(
                      mentee._id
                    );

                    return (
                      <tr
                        key={mentee._id}
                        className="border-b border-white/5 last:border-0"
                      >
                        {/* Mentee */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {mentee.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {mentee.email}
                            </p>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {mentee.course || "-"}
                        </td>

                        {/* Division */}
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {mentee.division || "-"}
                        </td>

                        {/* Roll */}
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {mentee.rollNumber || "-"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {!record ? (
                            <span className="rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400">
                              Not Marked
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                                record.status ===
                                "Present"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {record.status ===
                              "Present" ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}

                              {record.status}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {!record ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleMarkAttendance(
                                      mentee._id,
                                      "Present"
                                    )
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-500"
                                >
                                  Present
                                </button>

                                <button
                                  onClick={() =>
                                    handleMarkAttendance(
                                      mentee._id,
                                      "Absent"
                                    )
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-500"
                                >
                                  Absent
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  openEditModal(record)
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleViewHistory(mentee)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                            >
                              <History size={14} />
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredMentees.map((mentee) => {
                const record = getAttendanceRecord(
                  mentee._id
                );

                return (
                  <div
                    key={mentee._id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {mentee.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {mentee.email}
                        </p>
                      </div>

                      {!record ? (
                        <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[11px] font-medium text-yellow-400">
                          Not Marked
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            record.status === "Present"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {record.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-white/[0.03] p-2">
                        <p className="text-[10px] text-slate-500">
                          Course
                        </p>

                        <p className="mt-1 truncate text-xs text-white">
                          {mentee.course || "-"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white/[0.03] p-2">
                        <p className="text-[10px] text-slate-500">
                          Division
                        </p>

                        <p className="mt-1 text-xs text-white">
                          {mentee.division || "-"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white/[0.03] p-2">
                        <p className="text-[10px] text-slate-500">
                          Roll No.
                        </p>

                        <p className="mt-1 text-xs text-white">
                          {mentee.rollNumber || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!record ? (
                        <>
                          <button
                            onClick={() =>
                              handleMarkAttendance(
                                mentee._id,
                                "Present"
                              )
                            }
                            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                          >
                            Present
                          </button>

                          <button
                            onClick={() =>
                              handleMarkAttendance(
                                mentee._id,
                                "Absent"
                              )
                            }
                            className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-red-500"
                          >
                            Absent
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            openEditModal(record)
                          }
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Pencil size={14} />
                            Edit
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleViewHistory(mentee)
                        }
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
                      >
                        <span className="inline-flex items-center gap-2">
                          <History size={14} />
                          History
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty */}
            {filteredMentees.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Users
                  size={32}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-3 text-sm font-medium text-slate-300">
                  No mentees found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search.
                </p>
              </div>
            )}
          </div>

          {attendanceLoading && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2
                size={14}
                className="animate-spin"
              />
              Updating attendance...
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          EDIT ATTENDANCE MODAL
      ===================================================== */}
      {editOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Edit Attendance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Change the attendance status
                </p>
              </div>

              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditingRecord(null);
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">
                  Mentee
                </p>

                <p className="mt-1 font-medium text-white">
                  {editingRecord.mentee?.name || "-"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Date
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {formatDate(editingRecord.date)}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Attendance Status
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditStatus("Present")
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      editStatus === "Present"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <CheckCircle2
                      size={17}
                      className="mr-2 inline"
                    />
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditStatus("Absent")
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      editStatus === "Absent"
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <XCircle
                      size={17}
                      className="mr-2 inline"
                    />
                    Absent
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditingRecord(null);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateAttendance}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ATTENDANCE HISTORY MODAL
      ===================================================== */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <History size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Attendance History
                  </h2>

                  {historyMentee && (
                    <p className="mt-1 text-xs text-slate-500">
                      {historyMentee.name}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={closeHistory}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Student Info */}
            {historyMentee && (
              <div className="grid grid-cols-2 gap-3 border-b border-white/10 p-6 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] text-slate-500">
                    Course
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {historyMentee.course || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] text-slate-500">
                    Division
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {historyMentee.division || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] text-slate-500">
                    Semester
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {historyMentee.semester || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] text-slate-500">
                    Roll Number
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {historyMentee.rollNumber || "-"}
                  </p>
                </div>
              </div>
            )}

            {/* History */}
            <div className="max-h-[55vh] overflow-y-auto p-6">
              {historyLoading ? (
                <div className="flex min-h-[180px] items-center justify-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-blue-400"
                  />
                </div>
              ) : attendanceHistory.length === 0 ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                  <Calendar
                    size={32}
                    className="mb-3 text-slate-600"
                  />

                  <p className="text-sm font-medium text-slate-300">
                    No attendance history
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No attendance records found for this student.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendanceHistory.map((record) => {
                    const isPresent =
                      record.status === "Present";

                    return (
                      <div
                        key={record._id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              isPresent
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isPresent ? (
                              <CheckCircle2 size={19} />
                            ) : (
                              <XCircle size={19} />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              {formatDate(record.date)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Attendance Record
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isPresent
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-white/10 px-6 py-4">
              <button
                onClick={closeHistory}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAttendance;