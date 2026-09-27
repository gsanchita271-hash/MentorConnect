import { useEffect, useState } from "react";
import {
  Target,
  RefreshCw,
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MenteeSidebar from "./MenteeSidebar.jsx";

const API = "http://localhost:4000";

const MenteeTasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API}/api/tasks/mentee-tasks`,
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
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-500/10 text-red-400";
    }

    if (priority === "Medium") {
      return "bg-yellow-500/10 text-yellow-400";
    }

    return "bg-blue-500/10 text-blue-400";
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (status === "In Progress") {
      return "bg-blue-500/10 text-blue-400";
    }

    return "bg-slate-500/10 text-slate-400";
  };

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
                Tasks & Goals
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View the tasks and goals assigned by your mentor.
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
                onClick={fetchTasks}
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

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 rounded-xl bg-blue-500/10 p-3 text-blue-400 w-fit">
                <Target size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Total Tasks
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {tasks.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-emerald-400 w-fit">
                <CircleCheck size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Completed
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {
                  tasks.filter(
                    (task) => task.status === "Completed"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 rounded-xl bg-yellow-500/10 p-3 text-yellow-400 w-fit">
                <Clock3 size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {
                  tasks.filter(
                    (task) => task.status !== "Completed"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Tasks */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025]">

            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-medium">
                Assigned Tasks
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Tasks assigned by your mentor
              </p>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Target
                  size={36}
                  className="mx-auto mb-3 text-slate-600"
                />

                <p className="text-sm text-slate-400">
                  No tasks assigned yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 p-5 lg:grid-cols-2">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">
                          {task.title}
                        </h3>

                        {task.goal && (
                          <p className="mt-1 text-xs text-slate-500">
                            Goal: {task.goal}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="mb-5 text-sm leading-6 text-slate-400">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-slate-500 sm:flex-row sm:justify-between">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} />

                        Start:{" "}
                        {new Date(
                          task.startDate
                        ).toLocaleDateString("en-IN")}
                      </span>

                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} />

                        Due:{" "}
                        {new Date(
                          task.dueDate
                        ).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    {task.mentor && (
                      <p className="mt-3 text-xs text-slate-600">
                        Assigned by {task.mentor.name}
                      </p>
                    )}
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

export default MenteeTasks;