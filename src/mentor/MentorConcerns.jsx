import { useEffect, useMemo, useState } from "react";
import MentorSidebar from "../components/layout/MentorSidebar.jsx";

import {
  Search,
  AlertTriangle,
  Clock3,
  Eye,
  Pencil,
  Trash2,
  X,
  UserRound,
  CalendarDays,
  MessageSquareWarning,
  CheckCircle2,
  CircleDot,
  Flag,
  FileText,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const categories = [
  "All",
  "Academic",
  "Attendance",
  "Personal",
  "Career",
  "Financial",
  "Other",
];

const priorities = ["All", "Low", "Medium", "High"];

const statuses = [
  "All",
  "Pending",
  "In Review",
  "Resolved",
];

export default function MentorConcerns() {
  const [concerns, setConcerns] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedConcern, setSelectedConcern] =
    useState(null);

  const [editingConcern, setEditingConcern] =
    useState(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    status: "Pending",
    priority: "Medium",
    mentorResponse: "",
  });

  const token = sessionStorage.getItem("token");

  // =========================================================
  // FETCH CONCERNS
  // =========================================================

  const fetchConcerns = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/concerns/mentor-concerns`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch concerns"
        );
      }

      setConcerns(data.concerns || []);
    } catch (error) {
      console.error("Fetch concerns error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns();
  }, []);

  // =========================================================
  // EDIT
  // =========================================================

  const openEditModal = (concern) => {
    setEditingConcern(concern);

    setEditForm({
      status: concern.status || "Pending",
      priority: concern.priority || "Medium",
      mentorResponse:
        concern.mentorResponse || "",
    });

    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // UPDATE CONCERN
  // =========================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingConcern) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/concerns/${editingConcern._id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update concern"
        );
      }

      setConcerns((prev) =>
        prev.map((item) =>
          item._id === editingConcern._id
            ? data.concern
            : item
        )
      );

      if (
        selectedConcern?._id ===
        editingConcern._id
      ) {
        setSelectedConcern(data.concern);
      }

      setShowEditModal(false);
      setEditingConcern(null);

      alert("Concern updated successfully.");
    } catch (error) {
      console.error("Update concern error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this concern?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/concerns/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete concern"
        );
      }

      setConcerns((prev) =>
        prev.filter((item) => item._id !== id)
      );

      if (selectedConcern?._id === id) {
        setSelectedConcern(null);
      }

      alert("Concern deleted successfully.");
    } catch (error) {
      console.error("Delete concern error:", error);
      alert(error.message);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredConcerns = useMemo(() => {
    return concerns.filter((concern) => {
      const text =
        search.trim().toLowerCase();

      const matchesSearch =
        !text ||
        concern.title
          ?.toLowerCase()
          .includes(text) ||
        concern.description
          ?.toLowerCase()
          .includes(text) ||
        concern.mentee?.name
          ?.toLowerCase()
          .includes(text) ||
        concern.mentee?.email
          ?.toLowerCase()
          .includes(text);

      const matchesCategory =
        categoryFilter === "All" ||
        concern.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        concern.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "All" ||
        concern.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriority &&
        matchesStatus
      );
    });
  }, [
    concerns,
    search,
    categoryFilter,
    priorityFilter,
    statusFilter,
  ]);

  // =========================================================
  // STATS
  // =========================================================

  const total = concerns.length;

  const pending = concerns.filter(
    (item) => item.status === "Pending"
  ).length;

  const inReview = concerns.filter(
    (item) => item.status === "In Review"
  ).length;

  const resolved = concerns.filter(
    (item) => item.status === "Resolved"
  ).length;

  const highPriority = concerns.filter(
    (item) => item.priority === "High"
  ).length;

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // STYLES
  // =========================================================

  const priorityStyle = (priority) => {
    if (priority === "High") {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    if (priority === "Medium") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    return "border-green-500/20 bg-green-500/10 text-green-400";
  };

  const statusStyle = (status) => {
    if (status === "Resolved") {
      return "border-green-500/20 bg-green-500/10 text-green-400";
    }

    if (status === "In Review") {
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    }

    return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* SIDEBAR */}

      <MentorSidebar />

      {/* MAIN */}

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">

        <div className="p-4 pt-20 md:p-8 md:pt-8">

          {/* HEADER */}

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-blue-400">

                <MessageSquareWarning size={18} />

                <span className="text-xs font-semibold uppercase tracking-widest">
                  Mentor Workspace
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Concerns & Complaints
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Review mentee concerns, respond to issues,
                and track their resolution.
              </p>

            </div>

          </div>

          {/* STATS */}

          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-5">

            <StatCard
              title="Total Concerns"
              value={total}
              icon={MessageSquareWarning}
            />

            <StatCard
              title="Pending"
              value={pending}
              icon={Clock3}
            />

            <StatCard
              title="In Review"
              value={inReview}
              icon={CircleDot}
            />

            <StatCard
              title="Resolved"
              value={resolved}
              icon={CheckCircle2}
            />

            <StatCard
              title="High Priority"
              value={highPriority}
              icon={AlertTriangle}
            />

          </div>

          {/* FILTERS */}

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

            <div className="grid gap-3 xl:grid-cols-[1fr_170px_170px_170px]">

              {/* SEARCH */}

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search concern or mentee..."
                  className="w-full rounded-xl border border-white/10 bg-[#111827] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />

              </div>

              <DarkSelect
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                options={categories}
              />

              <DarkSelect
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
                options={priorities}
              />

              <DarkSelect
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                options={statuses}
              />

            </div>

          </div>

          {/* CONTENT */}

          {loading ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-14 text-center text-slate-500">
              Loading concerns...
            </div>

          ) : filteredConcerns.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">

              <MessageSquareWarning
                size={42}
                className="mx-auto mb-4 text-slate-700"
              />

              <h3 className="text-lg font-semibold text-slate-300">
                No concerns found
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                No concerns match your current filters.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {filteredConcerns.map((concern) => (

                <ConcernCard
                  key={concern._id}
                  concern={concern}
                  onView={() =>
                    setSelectedConcern(concern)
                  }
                  onEdit={() =>
                    openEditModal(concern)
                  }
                  onDelete={() =>
                    handleDelete(concern._id)
                  }
                  formatDate={formatDate}
                  priorityStyle={priorityStyle}
                  statusStyle={statusStyle}
                />

              ))}

            </div>

          )}

        </div>

      </main>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedConcern && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <p className="mb-1 text-xs uppercase tracking-wider text-blue-400">
                  Concern Details
                </p>

                <h2 className="text-xl font-semibold text-white">
                  {selectedConcern.title}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedConcern(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* STATUS */}

              <div className="flex flex-wrap gap-2">

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs ${statusStyle(
                    selectedConcern.status
                  )}`}
                >
                  {selectedConcern.status}
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs ${priorityStyle(
                    selectedConcern.priority
                  )}`}
                >
                  <Flag
                    size={11}
                    className="mr-1 inline"
                  />

                  {selectedConcern.priority} Priority
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                  {selectedConcern.category}
                </span>

              </div>

              {/* MENTEE */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <UserRound size={18} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-200">
                      {selectedConcern.mentee?.name ||
                        "Unknown mentee"}
                    </p>

                    <p className="text-xs text-slate-600">
                      {selectedConcern.mentee?.email}
                    </p>

                  </div>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">

                  <div>
                    <span className="text-slate-600">
                      Course
                    </span>

                    <p className="mt-1 text-slate-400">
                      {selectedConcern.mentee?.course ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-600">
                      Division
                    </span>

                    <p className="mt-1 text-slate-400">
                      {selectedConcern.mentee?.division ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-600">
                      Semester
                    </span>

                    <p className="mt-1 text-slate-400">
                      {selectedConcern.mentee?.semester ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-600">
                      Roll Number
                    </span>

                    <p className="mt-1 text-slate-400">
                      {selectedConcern.mentee
                        ?.rollNumber || "-"}
                    </p>
                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}

              <section>

                <div className="mb-2 flex items-center gap-2">

                  <FileText
                    size={15}
                    className="text-slate-600"
                  />

                  <p className="text-xs uppercase tracking-wider text-slate-600">
                    Description
                  </p>

                </div>

                <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-slate-400">
                  {selectedConcern.description}
                </p>

              </section>

              {/* DATE */}

              <div className="flex items-center gap-2 text-xs text-slate-600">

                <CalendarDays size={14} />

                Submitted{" "}
                {formatDate(
                  selectedConcern.createdAt
                )}

              </div>

              {/* RESPONSE */}

              {selectedConcern.mentorResponse && (

                <section>

                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                    Mentor Response
                  </p>

                  <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.04] p-4 text-sm leading-6 text-slate-300">
                    {selectedConcern.mentorResponse}
                  </div>

                </section>

              )}

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">

              <button
                onClick={() => {
                  setSelectedConcern(null);
                  openEditModal(selectedConcern);
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
              >
                <Pencil size={15} />
                Update
              </button>

              <button
                onClick={() => {
                  setSelectedConcern(null);
                  handleDelete(selectedConcern._id);
                }}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/15"
              >
                <Trash2 size={15} />
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showEditModal && editingConcern && (

        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <p className="text-xs uppercase tracking-wider text-blue-400">
                  Manage Concern
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {editingConcern.title}
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleUpdate}
              className="space-y-5 p-6"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <SelectField
                  label="Status"
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  options={[
                    "Pending",
                    "In Review",
                    "Resolved",
                  ]}
                />

                <SelectField
                  label="Priority"
                  name="priority"
                  value={editForm.priority}
                  onChange={handleEditChange}
                  options={[
                    "Low",
                    "Medium",
                    "High",
                  ]}
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Mentor Response
                </label>

                <textarea
                  name="mentorResponse"
                  value={editForm.mentorResponse}
                  onChange={handleEditChange}
                  rows={5}
                  placeholder="Write your response or resolution..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />

              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

// =========================================================
// CONCERN CARD
// =========================================================

function ConcernCard({
  concern,
  onView,
  onEdit,
  onDelete,
  formatDate,
  priorityStyle,
  statusStyle,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.035]">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}

        <div className="min-w-0 flex-1">

          <div className="mb-3 flex flex-wrap gap-2">

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] ${statusStyle(
                concern.status
              )}`}
            >
              {concern.status}
            </span>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] ${priorityStyle(
                concern.priority
              )}`}
            >
              {concern.priority} Priority
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-500">
              {concern.category}
            </span>

          </div>

          <h2 className="text-lg font-semibold text-white">
            {concern.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
            {concern.description}
          </p>

          {/* MENTEE */}

          <div className="mt-4 flex flex-wrap items-center gap-4">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <UserRound size={15} />
              </div>

              <div>

                <p className="text-xs font-medium text-slate-300">
                  {concern.mentee?.name ||
                    "Unknown mentee"}
                </p>

                <p className="text-[10px] text-slate-600">
                  {concern.mentee?.course || ""}
                  {concern.mentee?.division
                    ? ` • ${concern.mentee.division}`
                    : ""}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">

              <CalendarDays size={13} />

              {formatDate(concern.createdAt)}

            </div>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 items-center gap-2 lg:flex-col xl:flex-row">

          <button
            onClick={onView}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <Eye size={15} />
            View
          </button>

          <button
            onClick={onEdit}
            className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-2.5 text-blue-400 hover:bg-blue-500/10"
            title="Update"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={onDelete}
            className="rounded-xl border border-red-500/10 bg-red-500/5 p-2.5 text-red-400 hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">

      <div className="mb-4 flex items-center justify-between">

        <span className="text-xs text-slate-500">
          {title}
        </span>

        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
          <Icon size={17} />
        </div>

      </div>

      <p className="text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

// =========================================================
// DARK SELECT
// =========================================================

function DarkSelect({
  value,
  onChange,
  options,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
          className="bg-[#111827] text-white"
        >
          {option}
        </option>
      ))}
    </select>
  );
}

// =========================================================
// SELECT FIELD
// =========================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#111827] text-white"
          >
            {option}
          </option>
        ))}
      </select>

    </div>
  );
}