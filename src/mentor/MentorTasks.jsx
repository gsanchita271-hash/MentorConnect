import { useEffect, useMemo, useState } from "react";
import MentorSidebar from "../components/layout/MentorSidebar.jsx";

import {
  Plus,
  Search,
  Target,
  Clock3,
  CheckCircle2,
  Circle,
  AlertCircle,
  Users,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Eye,
  Flag,
  UserRound,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const emptyForm = {
  menteeIds: [],
  title: "",
  description: "",
  goal: "",
  startDate: "",
  dueDate: "",
  priority: "Medium",
  status: "Pending",
};

export default function MentorTasks() {
  const [mentees, setMentees] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = sessionStorage.getItem("token");

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${API}/tasks/my-tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch tasks"
        );
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Fetch tasks error:", error);
    }
  };

  const fetchMentees = async () => {
    try {
      const response = await fetch(
        `${API}/auth/my-mentees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch mentees"
        );
      }

      setMentees(data.mentees || []);
    } catch (error) {
      console.error("Fetch mentees error:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchTasks(),
        fetchMentees(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMentee = (id) => {
    setForm((prev) => {
      const exists = prev.menteeIds.includes(id);

      return {
        ...prev,
        menteeIds: exists
          ? prev.menteeIds.filter(
              (menteeId) => menteeId !== id
            )
          : [...prev.menteeIds, id],
      };
    });
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingTask(null);

    setForm({
      ...emptyForm,
      menteeIds: [],
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      menteeIds:
        task.mentees?.map(
          (mentee) => mentee._id
        ) || [],

      title: task.title || "",
      description: task.description || "",
      goal: task.goal || "",

      startDate: task.startDate
        ? new Date(task.startDate)
            .toISOString()
            .slice(0, 10)
        : "",

      dueDate: task.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .slice(0, 10)
        : "",

      priority: task.priority || "Medium",
      status: task.status || "Pending",
    });

    setShowModal(true);
  };

  // =========================================================
  // CREATE / UPDATE TASK
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.menteeIds.length === 0) {
      alert("Please select at least one mentee.");
      return;
    }

    if (!form.title.trim()) {
      alert("Task title is required.");
      return;
    }

    if (!form.startDate || !form.dueDate) {
      alert("Start date and deadline are required.");
      return;
    }

    if (
      new Date(form.dueDate) <
      new Date(form.startDate)
    ) {
      alert("Deadline cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const url = editingTask
        ? `${API}/tasks/${editingTask._id}`
        : `${API}/tasks`;

      const method = editingTask
        ? "PATCH"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          menteeIds: form.menteeIds,
          title: form.title,
          description: form.description,
          goal: form.goal,
          priority: form.priority,
          status: form.status,
          startDate: form.startDate,
          dueDate: form.dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      alert(
        editingTask
          ? "Task updated successfully"
          : "Task created successfully"
      );

      setShowModal(false);
      setEditingTask(null);
      setForm({
        ...emptyForm,
        menteeIds: [],
      });

      await fetchTasks();
    } catch (error) {
      console.error("Task save error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/tasks/${taskId}`,
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
          data.message || "Failed to delete task"
        );
      }

      setTasks((prev) =>
        prev.filter(
          (task) => task._id !== taskId
        )
      );

      if (selectedTask?._id === taskId) {
        setSelectedTask(null);
      }

      alert("Task deleted successfully.");
    } catch (error) {
      console.error(
        "Delete task error:",
        error
      );
      alert(error.message);
    }
  };

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        task.title
          ?.toLowerCase()
          .includes(searchText) ||
        task.goal
          ?.toLowerCase()
          .includes(searchText) ||
        task.mentees?.some((mentee) =>
          mentee.name
            ?.toLowerCase()
            .includes(searchText)
        );

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus
      );
    });
  }, [
    tasks,
    search,
    priorityFilter,
    statusFilter,
  ]);

  // =========================================================
  // STATS
  // =========================================================

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const progressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "High"
  ).length;

  // =========================================================
  // DATE FORMAT
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
  // PRIORITY STYLE
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

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const statusStyle = (status) => {
    if (status === "Completed") {
      return "border-green-500/20 bg-green-500/10 text-green-400";
    }

    if (status === "In Progress") {
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    }

    return "border-slate-500/20 bg-slate-500/10 text-slate-400";
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* SIDEBAR */}

      <MentorSidebar />

      {/* MAIN CONTENT */}

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">

        <div className="p-4 pt-20 md:p-8 md:pt-8">

          {/* HEADER */}

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2 text-blue-400">
                <Target size={18} />

                <span className="text-xs font-semibold uppercase tracking-widest">
                  Mentor Workspace
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Tasks & Goals
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Create, assign and monitor mentee tasks.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:scale-[1.02]"
            >
              <Plus size={18} />
              Create Task
            </button>

          </div>

          {/* STATS */}

          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-5">

            <StatCard
              title="Total Tasks"
              value={totalTasks}
              icon={Target}
            />

            <StatCard
              title="Pending"
              value={pendingTasks}
              icon={Clock3}
            />

            <StatCard
              title="In Progress"
              value={progressTasks}
              icon={Circle}
            />

            <StatCard
              title="Completed"
              value={completedTasks}
              icon={CheckCircle2}
            />

            <StatCard
              title="High Priority"
              value={highPriorityTasks}
              icon={AlertCircle}
            />

          </div>

          {/* FILTER BAR */}

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">

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
                  placeholder="Search tasks or mentees..."
                  className="w-full rounded-xl border border-white/10 bg-[#111827] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />

              </div>

              {/* PRIORITY */}

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
                className="cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option className="bg-[#111827]">
                  All
                </option>

                <option className="bg-[#111827]">
                  Low
                </option>

                <option className="bg-[#111827]">
                  Medium
                </option>

                <option className="bg-[#111827]">
                  High
                </option>
              </select>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option className="bg-[#111827]">
                  All
                </option>

                <option className="bg-[#111827]">
                  Pending
                </option>

                <option className="bg-[#111827]">
                  In Progress
                </option>

                <option className="bg-[#111827]">
                  Completed
                </option>
              </select>

            </div>

          </div>

          {/* TASK LIST */}

          {loading ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center text-slate-500">
              Loading tasks...
            </div>

          ) : filteredTasks.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">

              <Target
                size={42}
                className="mx-auto mb-4 text-slate-700"
              />

              <h3 className="text-lg font-semibold text-slate-300">
                No tasks found
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Create a task and assign it to your mentees.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold"
              >
                Create Task
              </button>

            </div>

          ) : (

            <div className="grid gap-5 xl:grid-cols-2">

              {filteredTasks.map((task) => (

                <div
                  key={task._id}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <div className="mb-3 flex flex-wrap gap-2">

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${priorityStyle(
                            task.priority
                          )}`}
                        >
                          <Flag
                            size={11}
                            className="mr-1 inline"
                          />

                          {task.priority}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>

                      </div>

                      <h2 className="truncate text-lg font-semibold text-white">
                        {task.title}
                      </h2>

                      {task.goal && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                          {task.goal}
                        </p>
                      )}

                    </div>

                    <div className="flex shrink-0 gap-1">

                      <button
                        onClick={() =>
                          setSelectedTask(task)
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                        title="View task"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        onClick={() =>
                          openEditModal(task)
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-500/10 hover:text-blue-400"
                        title="Edit task"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(task._id)
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                        title="Delete task"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                  {/* INFO */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <InfoBox
                      icon={Users}
                      label="Mentees"
                      value={`${task.mentees?.length || 0} assigned`}
                    />

                    <InfoBox
                      icon={CalendarDays}
                      label="Deadline"
                      value={formatDate(task.dueDate)}
                    />

                  </div>

                  {/* MENTEES */}

                  <div className="mt-4">

                    <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-600">
                      Assigned mentees
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {task.mentees
                        ?.slice(0, 4)
                        .map((mentee) => (

                          <span
                            key={mentee._id}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-400"
                          >
                            {mentee.name}
                          </span>

                        ))}

                      {task.mentees?.length > 4 && (
                        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-500">
                          +{task.mentees.length - 4} more
                        </span>
                      )}

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                    <span className="text-xs text-slate-600">
                      Started{" "}
                      {formatDate(task.startDate)}
                    </span>

                    <button
                      onClick={() =>
                        setSelectedTask(task)
                      }
                      className="text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      View details →
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1120] px-6 py-5">

              <div>

                <h2 className="text-lg font-semibold">
                  {editingTask
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingTask
                    ? "Update task details and assignment."
                    : "Create and assign a task to your mentees."}
                </p>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >

              {/* MENTEES */}

              <div>

                <label className="mb-3 block text-sm font-medium text-slate-300">
                  Assign Mentees
                </label>

                <div className="grid max-h-44 gap-2 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-2">

                  {mentees.length === 0 ? (

                    <p className="col-span-full py-4 text-center text-sm text-slate-600">
                      No mentees assigned to you.
                    </p>

                  ) : (

                    mentees.map((mentee) => {

                      const selected =
                        form.menteeIds.includes(
                          mentee._id
                        );

                      return (
                        <button
                          type="button"
                          key={mentee._id}
                          onClick={() =>
                            toggleMentee(
                              mentee._id
                            )
                          }
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >

                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              selected
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-white/5 text-slate-500"
                            }`}
                          >
                            <UserRound size={15} />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-slate-200">
                              {mentee.name}
                            </p>

                            <p className="truncate text-[11px] text-slate-600">
                              {mentee.course ||
                                "Mentee"}

                              {mentee.division
                                ? ` • ${mentee.division}`
                                : ""}
                            </p>

                          </div>

                        </button>
                      );
                    })
                  )}

                </div>

                <p className="mt-2 text-xs text-slate-600">
                  {form.menteeIds.length} mentee(s) selected
                </p>

              </div>

              {/* TITLE */}

              <Input
                label="Task Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Complete React project"
                required
              />

              {/* GOAL */}

              <Input
                label="Goal / Objective"
                name="goal"
                value={form.goal}
                onChange={handleChange}
                placeholder="What should the mentee achieve?"
              />

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add task instructions..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />

              </div>

              {/* DATES */}

              <div className="grid gap-4 sm:grid-cols-2">

                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Deadline"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* PRIORITY + STATUS */}

              <div className="grid gap-4 sm:grid-cols-2">

                <Select
                  label="Priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  options={[
                    "Low",
                    "Medium",
                    "High",
                  ]}
                />

                <Select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    "Pending",
                    "In Progress",
                    "Completed",
                  ]}
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                    ? "Update Task"
                    : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedTask && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <p className="mb-1 text-xs uppercase tracking-wider text-blue-400">
                  Task Details
                </p>

                <h2 className="text-xl font-semibold">
                  {selectedTask.title}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedTask(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            <div className="space-y-6 p-6">

              <div className="flex flex-wrap gap-2">

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs ${priorityStyle(
                    selectedTask.priority
                  )}`}
                >
                  {selectedTask.priority} Priority
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs ${statusStyle(
                    selectedTask.status
                  )}`}
                >
                  {selectedTask.status}
                </span>

              </div>

              {selectedTask.goal && (
                <section>

                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                    Goal
                  </p>

                  <p className="text-sm leading-6 text-slate-300">
                    {selectedTask.goal}
                  </p>

                </section>
              )}

              {selectedTask.description && (
                <section>

                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                    Description
                  </p>

                  <p className="text-sm leading-6 text-slate-400">
                    {selectedTask.description}
                  </p>

                </section>
              )}

              <div className="grid gap-4 sm:grid-cols-2">

                <InfoBox
                  icon={CalendarDays}
                  label="Start Date"
                  value={formatDate(
                    selectedTask.startDate
                  )}
                />

                <InfoBox
                  icon={Clock3}
                  label="Deadline"
                  value={formatDate(
                    selectedTask.dueDate
                  )}
                />

              </div>

              <section>

                <p className="mb-3 text-xs uppercase tracking-wider text-slate-600">
                  Assigned Mentees
                </p>

                <div className="space-y-2">

                  {selectedTask.mentees?.map(
                    (mentee) => (

                      <div
                        key={mentee._id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3"
                      >

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <UserRound size={16} />
                        </div>

                        <div>

                          <p className="text-sm font-medium text-slate-200">
                            {mentee.name}
                          </p>

                          <p className="text-xs text-slate-600">
                            {mentee.email}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>

            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">

              <button
                onClick={() => {
                  setSelectedTask(null);
                  openEditModal(
                    selectedTask
                  );
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                onClick={() => {
                  handleDelete(
                    selectedTask._id
                  );
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
// INFO BOX
// =========================================================

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

      <div className="flex items-center gap-2 text-slate-600">

        <Icon size={14} />

        <span className="text-[11px] uppercase tracking-wider">
          {label}
        </span>

      </div>

      <p className="mt-2 text-sm font-medium text-slate-300">
        {value}
      </p>

    </div>
  );
}

// =========================================================
// INPUT
// =========================================================

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
      />

    </div>
  );
}

// =========================================================
// SELECT
// =========================================================

function Select({
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