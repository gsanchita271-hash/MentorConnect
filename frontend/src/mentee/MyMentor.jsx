import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  GraduationCap,
  IdCard,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MenteeSidebar from "../mentee/MenteeSidebar.jsx";

const API = "http://localhost:4000";

export default function MyMentor() {
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMentor();
  }, []);

  const fetchMentor = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `${API}/api/auth/my-mentor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch mentor"
        );
      }

      setMentor(data.mentor);
    } catch (error) {
      console.error("My mentor error:", error);

      setError(
        error.message || "Failed to load mentor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <MenteeSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">

        <div className="p-5 sm:p-7 lg:p-10">

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <button
                onClick={() => navigate("/mentee/dashboard")}
                className="mb-4 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>

              <p className="mb-2 text-sm font-medium text-blue-400">
                Mentee Portal
              </p>

              <h1 className="text-2xl font-bold sm:text-3xl">
                My Mentor
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                View your assigned mentor and their details.
              </p>
            </div>

            <button
              onClick={fetchMentor}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-slate-500">
              Loading mentor details...
            </div>
          ) : mentor ? (
            <div className="max-w-3xl">

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">

                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400">
                    <User
                      size={34}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      {mentor.name}
                    </h2>

                    <p className="mt-1 text-sm text-blue-400">
                      {mentor.designation || "Mentor"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {mentor.department || "Department not available"}
                    </p>
                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <InfoCard
                    icon={Mail}
                    label="Email"
                    value={mentor.email}
                  />

                  <InfoCard
                    icon={Building2}
                    label="Department"
                    value={mentor.department}
                  />

                  <InfoCard
                    icon={Briefcase}
                    label="Designation"
                    value={mentor.designation}
                  />

                  <InfoCard
                    icon={IdCard}
                    label="Employee ID"
                    value={mentor.employeeId}
                  />

                  <InfoCard
                    icon={GraduationCap}
                    label="Qualification"
                    value={mentor.qualification}
                  />

                  <InfoCard
                    icon={Briefcase}
                    label="Experience"
                    value={mentor.experience}
                  />

                </div>

              </div>

            </div>
          ) : (
            !error && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
                <User
                  size={30}
                  className="mx-auto mb-4 text-slate-600"
                />

                <h3 className="text-sm font-semibold">
                  No mentor assigned
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  Your mentor has not been assigned yet.
                </p>
              </div>
            )
          )}

        </div>

      </main>

    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
        <Icon
          size={17}
          className="text-blue-400"
        />
      </div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {value || "Not available"}
      </p>

    </div>
  );
}