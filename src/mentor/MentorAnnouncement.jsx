import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  CalendarDays,
  AlertTriangle,
  Eye,
} from "lucide-react";

import MentorSidebar from "../components/layout/MentorSidebar.jsx";

const API = import.meta.env.VITE_API_URL;

const emptyForm = {
  title: "",
  message: "",
  priority: "Normal",
  publishDate: "",
  mentees: [],
};

const priorityStyles = {
  Normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Important: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Urgent: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function MentorAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [mentees, setMentees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const token = sessionStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [announcementRes, menteeRes] =
        await Promise.all([
          fetch(
            `${API}/announcements/my-announcements`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(`${API}/auth/my-mentees`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const announcementData =
        await announcementRes.json();

      const menteeData =
        await menteeRes.json();

      if (announcementRes.ok) {
        setAnnouncements(
          announcementData.announcements || []
        );
      }

      if (menteeRes.ok) {
        setMentees(
          menteeData.mentees || []
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        announcement.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        announcement.message
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "All" ||
        announcement.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [announcements, search, priorityFilter]);

  const stats = {
    total: announcements.length,

    normal: announcements.filter(
      (a) => a.priority === "Normal"
    ).length,

    important: announcements.filter(
      (a) => a.priority === "Important"
    ).length,

    urgent: announcements.filter(
      (a) => a.priority === "Urgent"
    ).length,
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);

    setForm({
      title: announcement.title || "",
      message: announcement.message || "",
      priority: announcement.priority || "Normal",
      publishDate: announcement.publishDate
        ? new Date(announcement.publishDate)
            .toISOString()
            .slice(0, 16)
        : "",
      mentees:
        announcement.mentees?.map(
          (mentee) => mentee._id
        ) || [],
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAnnouncement(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMentee = (id) => {
    setForm((prev) => ({
      ...prev,
      mentees: prev.mentees.includes(id)
        ? prev.mentees.filter(
            (menteeId) => menteeId !== id
          )
        : [...prev.mentees, id],
    }));
  };

  const selectAllMentees = () => {
    if (form.mentees.length === mentees.length) {
      setForm((prev) => ({
        ...prev,
        mentees: [],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        mentees: mentees.map(
          (mentee) => mentee._id
        ),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter announcement title");
      return;
    }

    if (!form.message.trim()) {
      alert("Please enter announcement message");
      return;
    }

    if (form.mentees.length === 0) {
      alert("Please select at least one mentee");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        message: form.message,
        priority: form.priority,
        mentees: form.mentees,
        publishDate:
          form.publishDate ||
          new Date().toISOString(),
      };

      const url = editingAnnouncement
        ? `${API}/announcements/${editingAnnouncement._id}`
        : `${API}/announcements`;

      const method = editingAnnouncement
        ? "PATCH"
        : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Something went wrong"
        );
        return;
      }

      closeModal();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/announcements/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to delete"
        );
        return;
      }

      setAnnouncements((prev) =>
        prev.filter(
          (announcement) =>
            announcement._id !== id
        )
      );
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const openDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <MentorSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="p-5 sm:p-7 lg:p-10">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                  <Bell
                    size={22}
                    className="text-blue-400"
                  />
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Announcements
                </h1>
              </div>

              <p className="text-sm text-slate-400">
                Share important updates and
                information with your mentees.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:scale-[1.02]"
            >
              <Plus size={18} />
              Create Announcement
            </button>
          </div>

          {/* STATS */}
          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              title="Total"
              value={stats.total}
              icon={<Bell size={18} />}
            />

            <StatCard
              title="Normal"
              value={stats.normal}
              icon={<Bell size={18} />}
            />

            <StatCard
              title="Important"
              value={stats.important}
              icon={<AlertTriangle size={18} />}
            />

            <StatCard
              title="Urgent"
              value={stats.urgent}
              icon={<AlertTriangle size={18} />}
            />
          </div>

          {/* SEARCH + FILTER */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
            >
              <option
                value="All"
                className="bg-[#111827]"
              >
                All Priorities
              </option>

              <option
                value="Normal"
                className="bg-[#111827]"
              >
                Normal
              </option>

              <option
                value="Important"
                className="bg-[#111827]"
              >
                Important
              </option>

              <option
                value="Urgent"
                className="bg-[#111827]"
              >
                Urgent
              </option>
            </select>
          </div>

          {/* ANNOUNCEMENTS */}
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center text-slate-400">
              Loading announcements...
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <Bell
                size={40}
                className="mx-auto mb-4 text-slate-600"
              />

              <h3 className="mb-2 text-lg font-semibold">
                No announcements found
              </h3>

              <p className="mb-5 text-sm text-slate-500">
                Create your first announcement
                for your mentees.
              </p>

              <button
                onClick={openCreateModal}
                className="mx-auto flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
              >
                <Plus size={17} />
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredAnnouncements.map(
                (announcement) => (
                  <div
                    key={announcement._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-500/20"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                              priorityStyles[
                                announcement.priority
                              ]
                            }`}
                          >
                            {announcement.priority}
                          </span>

                          <span className="text-xs text-slate-500">
                            {formatDate(
                              announcement.publishDate
                            )}
                          </span>
                        </div>

                        <h2 className="text-lg font-semibold text-white">
                          {announcement.title}
                        </h2>
                      </div>

                      <Bell
                        size={19}
                        className="shrink-0 text-blue-400"
                      />
                    </div>

                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-400">
                      {announcement.message}
                    </p>

                    <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
                      <Users size={15} />

                      <span>
                        {announcement.mentees
                          ?.length || 0}{" "}
                        mentee
                        {announcement.mentees
                          ?.length === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                      <button
                        onClick={() =>
                          openDetails(
                            announcement
                          )
                        }
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06]"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        onClick={() =>
                          openEditModal(
                            announcement
                          )
                        }
                        className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/15"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            announcement._id
                          )
                        }
                        className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/15"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0b1120] p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingAnnouncement
                    ? "Edit Announcement"
                    : "Create Announcement"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Send an update to your assigned
                  mentees.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter announcement title"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>

              {/* MESSAGE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Message
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write your announcement..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>

              {/* PRIORITY + DATE */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                  >
                    <option
                      value="Normal"
                      className="bg-[#111827]"
                    >
                      Normal
                    </option>

                    <option
                      value="Important"
                      className="bg-[#111827]"
                    >
                      Important
                    </option>

                    <option
                      value="Urgent"
                      className="bg-[#111827]"
                    >
                      Urgent
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Publish Date
                  </label>

                  <input
                    type="datetime-local"
                    name="publishDate"
                    value={form.publishDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              {/* MENTEES */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Send To
                  </label>

                  <button
                    type="button"
                    onClick={selectAllMentees}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    {form.mentees.length ===
                    mentees.length
                      ? "Clear All"
                      : "Select All"}
                  </button>
                </div>

                <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3">

                  {mentees.length === 0 ? (
                    <p className="p-3 text-sm text-slate-500">
                      No approved mentees assigned
                      to you.
                    </p>
                  ) : (
                    mentees.map((mentee) => (
                      <label
                        key={mentee._id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-white/[0.02] p-3 transition hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        <input
                          type="checkbox"
                          checked={form.mentees.includes(
                            mentee._id
                          )}
                          onChange={() =>
                            toggleMentee(
                              mentee._id
                            )
                          }
                          className="h-4 w-4 accent-blue-500"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {mentee.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {mentee.email}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {form.mentees.length} mentee
                  {form.mentees.length === 1
                    ? ""
                    : "s"} selected
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingAnnouncement
                    ? "Update Announcement"
                    : "Publish Announcement"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails &&
        selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120]">

              <div className="flex items-start justify-between border-b border-white/10 p-5">

                <div>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${
                      priorityStyles[
                        selectedAnnouncement.priority
                      ]
                    }`}
                  >
                    {selectedAnnouncement.priority}
                  </span>

                  <h2 className="mt-3 text-xl font-bold">
                    {selectedAnnouncement.title}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setShowDetails(false)
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="space-y-6 p-5">

                {/* MESSAGE */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Message
                  </p>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {selectedAnnouncement.message}
                  </p>
                </div>

                {/* INFO */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <CalendarDays size={16} />

                      <span className="text-xs">
                        Publish Date
                      </span>
                    </div>

                    <p className="text-sm text-white">
                      {formatDate(
                        selectedAnnouncement.publishDate,
                        true
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Users size={16} />

                      <span className="text-xs">
                        Recipients
                      </span>
                    </div>

                    <p className="text-sm text-white">
                      {selectedAnnouncement.mentees
                        ?.length || 0}{" "}
                      mentees
                    </p>
                  </div>

                </div>

                {/* RECIPIENTS */}
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Sent To
                  </p>

                  <div className="space-y-2">

                    {selectedAnnouncement.mentees?.map(
                      (mentee) => (
                        <div
                          key={mentee._id}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                        >

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                            {mentee.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {mentee.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {mentee.email}
                            </p>
                          </div>

                        </div>
                      )
                    )}

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {title}
        </span>

        <div className="text-blue-400">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function formatDate(
  date,
  detailed = false
) {
  if (!date) return "Not scheduled";

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(detailed && {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  );
}