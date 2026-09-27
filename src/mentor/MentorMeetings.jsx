import { useEffect, useState } from "react";

import {
  Calendar,
  Clock,
  Users,
  Plus,
  CheckCircle2,
  Loader2,
  Video,
  X,
} from "lucide-react";

import MentorSidebar from "../components/layout/MentorSidebar.jsx";

const API = import.meta.env.VITE_API_URL;

function MentorMeetings() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mentees, setMentees] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const [loadingMentees, setLoadingMentees] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [selectedMentees, setSelectedMentees] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    agenda: "",
    date: "",
    time: "",
    meetingLink: "",
  });

  const token = sessionStorage.getItem("token");

  // Fetch Mentor's Mentees
  const fetchMentees = async () => {
    try {
      setLoadingMentees(true);

      const response = await fetch(`${API}/auth/my-mentees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch mentees");
      }

      setMentees(data.mentees || []);
    } catch (error) {
      console.error("Fetch mentees error:", error);
    } finally {
      setLoadingMentees(false);
    }
  };

  // Fetch Meetings
  const fetchMeetings = async () => {
    try {
      setLoadingMeetings(true);

      // FIXED: /auth removed
      const response = await fetch(`${API}/meetings/my-meetings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch meetings");
      }

      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("Fetch meetings error:", error);
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchMentees();
    fetchMeetings();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Select / Unselect Individual Mentee
  const toggleMentee = (id) => {
    setSelectedMentees((prev) =>
      prev.includes(id)
        ? prev.filter((menteeId) => menteeId !== id)
        : [...prev, id]
    );
  };

  // Select All
  const toggleSelectAll = () => {
    if (selectedMentees.length === mentees.length) {
      setSelectedMentees([]);
    } else {
      setSelectedMentees(mentees.map((mentee) => mentee._id));
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      title: "",
      agenda: "",
      date: "",
      time: "",
      meetingLink: "",
    });

    setSelectedMentees([]);
  };

  // Close Modal
  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    resetForm();
  };

  // Create Meeting
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedMentees.length === 0) {
      alert("Please select at least one mentee.");
      return;
    }

    if (!formData.date || !formData.time) {
      alert("Please select date and time.");
      return;
    }

    if (!formData.meetingLink.trim()) {
      alert("Please enter the meeting link.");
      return;
    }

    try {
      setSubmitting(true);

      const dateTime = new Date(
        `${formData.date}T${formData.time}`
      );

      // FIXED: /auth removed
      const response = await fetch(`${API}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menteeIds: selectedMentees,
          title: formData.title,
          agenda: formData.agenda,
          date: dateTime.toISOString(),
          meetingLink: formData.meetingLink,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to schedule meeting"
        );
      }

      alert("Meeting scheduled successfully!");

      setMeetings((prev) => [data.meeting, ...prev]);

      closeModal();
    } catch (error) {
      console.error("Create meeting error:", error);

      alert(error.message || "Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <MentorSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

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
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <h1 className="text-2xl font-semibold">
              Meetings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Schedule and manage meetings with your mentees.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium transition hover:bg-blue-500"
          >
            <Plus size={18} />
            Schedule Meeting
          </button>
        </header>

        {/* Content */}
        <section className="p-6 md:p-8">
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Users size={20} />
              </div>

              <p className="text-sm text-slate-500">
                My Mentees
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {mentees.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Calendar size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Scheduled Meetings
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {meetings.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Upcoming
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {
                  meetings.filter(
                    (meeting) =>
                      new Date(meeting.date) > new Date()
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Meetings List */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold">
                Scheduled Meetings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your upcoming and scheduled mentor meetings.
              </p>
            </div>

            {loadingMeetings ? (
              <div className="flex items-center justify-center py-16 text-slate-500">
                <Loader2
                  size={22}
                  className="mr-2 animate-spin"
                />
                Loading meetings...
              </div>
            ) : meetings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Calendar
                  size={40}
                  className="mx-auto mb-4 text-slate-600"
                />

                <p className="text-slate-400">
                  No meetings scheduled yet.
                </p>

                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                >
                  Schedule your first meeting
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {meetings.map((meeting) => {
                  const meetingDate = new Date(meeting.date);

                  return (
                    <div
                      key={meeting._id}
                      className="p-6 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex flex-col justify-between gap-5 lg:flex-row">
                        <div className="min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                              <Video size={19} />
                            </div>

                            <div>
                              <h3 className="text-base font-semibold">
                                {meeting.title}
                              </h3>

                              {meeting.agenda && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {meeting.agenda}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Date & Time */}
                          <div className="mt-5 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-slate-400">
                              <Calendar
                                size={15}
                                className="text-blue-400"
                              />

                              {meetingDate.toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-slate-400">
                              <Clock
                                size={15}
                                className="text-cyan-400"
                              />

                              {meetingDate.toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-slate-400">
                              <Users
                                size={15}
                                className="text-blue-400"
                              />

                              {meeting.mentees?.length || 0} mentee
                              {meeting.mentees?.length !== 1
                                ? "s"
                                : ""}
                            </div>
                          </div>

                          {/* Mentees */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {meeting.mentees?.map((mentee) => (
                              <span
                                key={mentee._id}
                                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400"
                              >
                                {mentee.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Meeting Button */}
                        <div className="flex shrink-0 items-start">
                          {meeting.meetingLink && (
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium transition hover:bg-blue-500"
                            >
                              <Video size={17} />
                              Open Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Schedule Meeting
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a meeting for one or multiple mentees.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {/* Select Mentees */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Select Mentees
                  </label>

                  {mentees.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {selectedMentees.length === mentees.length
                        ? "Unselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>

                {loadingMentees ? (
                  <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-8 text-sm text-slate-500">
                    <Loader2
                      size={18}
                      className="mr-2 animate-spin"
                    />
                    Loading mentees...
                  </div>
                ) : mentees.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-500">
                    No approved mentees assigned to you.
                  </div>
                ) : (
                  <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    {mentees.map((mentee) => (
                      <label
                        key={mentee._id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition hover:bg-white/[0.04]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMentees.includes(
                            mentee._id
                          )}
                          onChange={() =>
                            toggleMentee(mentee._id)
                          }
                          className="h-4 w-4 accent-blue-600"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">
                            {mentee.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {mentee.course || "Course"}
                            {mentee.division
                              ? ` • Division ${mentee.division}`
                              : ""}
                            {mentee.semester
                              ? ` • Semester ${mentee.semester}`
                              : ""}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-slate-600">
                  {selectedMentees.length} mentee
                  {selectedMentees.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Meeting Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Monthly Mentoring Session"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Agenda */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Agenda
                </label>

                <textarea
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleChange}
                  placeholder="What will you discuss?"
                  rows="3"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Meeting Link */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Meeting Link
                </label>

                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <p className="mt-2 text-xs text-slate-600">
                  Paste your Google Meet, Zoom or Microsoft Teams link.
                </p>
              </div>

              {/* Date & Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Time
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar size={17} />
                      Schedule Meeting
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorMeetings;