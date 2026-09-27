import { useEffect, useState } from "react";
import {
  MessageSquareWarning,
  RefreshCw,
  ArrowLeft,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MenteeSidebar from "./MenteeSidebar.jsx";

const API = import.meta.env.VITE_API_URL;

const MenteeConcerns = () => {
  const navigate = useNavigate();

  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    priority: "Medium",
  });

  const fetchConcerns = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API}/concerns/mentee-concerns`,
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
      console.error(error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(`${API}/concerns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit concern"
        );
      }

      setFormData({
        title: "",
        description: "",
        category: "Other",
        priority: "Medium",
      });

      setShowForm(false);

      await fetchConcerns();
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (status === "In Review") {
      return "bg-blue-500/10 text-blue-400";
    }

    return "bg-yellow-500/10 text-yellow-400";
  };

  const getStatusIcon = (status) => {
    if (status === "Resolved") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "In Review") {
      return <AlertCircle size={14} />;
    }

    return <Clock3 size={14} />;
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-500/10 text-red-400";
    }

    if (priority === "Medium") {
      return "bg-yellow-500/10 text-yellow-400";
    }

    return "bg-blue-500/10 text-blue-400";
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
                Concerns & Complaints
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Raise a concern and track your mentor's response.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/mentee/dashboard")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>

              <button
                onClick={fetchConcerns}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Plus size={16} />
                Raise Concern
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
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Total */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 w-fit rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <MessageSquareWarning size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Total Concerns
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {concerns.length}
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 w-fit rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                <Clock3 size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {
                  concerns.filter(
                    (item) => item.status === "Pending"
                  ).length
                }
              </p>
            </div>

            {/* Resolved */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 w-fit rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <CheckCircle2 size={20} />
              </div>

              <p className="text-sm text-slate-500">
                Resolved
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {
                  concerns.filter(
                    (item) => item.status === "Resolved"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Concerns */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025]">

            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-medium">
                My Concerns
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your submitted concerns and mentor responses
              </p>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Loading concerns...
              </div>
            ) : concerns.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <MessageSquareWarning
                  size={36}
                  className="mx-auto mb-3 text-slate-600"
                />

                <p className="text-sm text-slate-400">
                  No concerns submitted yet.
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium transition hover:bg-blue-600"
                >
                  Raise Your First Concern
                </button>
              </div>
            ) : (
              <div className="space-y-4 p-5">
                {concerns.map((concern) => (
                  <div
                    key={concern._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                      <div>
                        <h3 className="font-medium">
                          {concern.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {concern.category}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${getPriorityStyle(
                            concern.priority
                          )}`}
                        >
                          {concern.priority}
                        </span>

                        <span
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${getStatusStyle(
                            concern.status
                          )}`}
                        >
                          {getStatusIcon(concern.status)}
                          {concern.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-slate-400">
                      {concern.description}
                    </p>

                    {concern.mentorResponse && (
                      <div className="mt-5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                        <p className="mb-1 text-xs font-medium text-blue-400">
                          Mentor Response
                        </p>

                        <p className="text-sm leading-6 text-slate-300">
                          {concern.mentorResponse}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 border-t border-white/5 pt-3 text-xs text-slate-600">
                      Submitted{" "}
                      {new Date(
                        concern.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Raise Concern Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  Raise a Concern
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your concern will be sent to your mentor.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Concern Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter your concern"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Explain your concern..."
                  rows={5}
                  required
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                >
                  <option
                    value="Academic"
                    className="bg-[#111827] text-white"
                  >
                    Academic
                  </option>

                  <option
                    value="Attendance"
                    className="bg-[#111827] text-white"
                  >
                    Attendance
                  </option>

                  <option
                    value="Personal"
                    className="bg-[#111827] text-white"
                  >
                    Personal
                  </option>

                  <option
                    value="Career"
                    className="bg-[#111827] text-white"
                  >
                    Career
                  </option>

                  <option
                    value="Financial"
                    className="bg-[#111827] text-white"
                  >
                    Financial
                  </option>

                  <option
                    value="Other"
                    className="bg-[#111827] text-white"
                  >
                    Other
                  </option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                >
                  <option
                    value="Low"
                    className="bg-[#111827] text-white"
                  >
                    Low
                  </option>

                  <option
                    value="Medium"
                    className="bg-[#111827] text-white"
                  >
                    Medium
                  </option>

                  <option
                    value="High"
                    className="bg-[#111827] text-white"
                  >
                    High
                  </option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Concern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenteeConcerns;