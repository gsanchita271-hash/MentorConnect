import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Building2,
  BriefcaseBusiness,
  BadgeCheck,
  GraduationCap,
  Clock3,
  ArrowLeft,
  RefreshCw,
  Pencil,
  X,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../components/layout/MentorSidebar.jsx";

const API = "http://localhost:4000";

const MentorProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showEdit, setShowEdit] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    designation: "",
    employeeId: "",
    qualification: "",
    experience: "",
  });

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch profile"
        );
      }

      setProfile(data.user);

      setFormData({
        name: data.user.name || "",
        department: data.user.department || "",
        designation: data.user.designation || "",
        employeeId: data.user.employeeId || "",
        qualification: data.user.qualification || "",
        experience: data.user.experience ?? "",
      });
    } catch (error) {
      console.error("Profile error:", error);

      setError(
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setFormData({
      name: profile?.name || "",
      department: profile?.department || "",
      designation: profile?.designation || "",
      employeeId: profile?.employeeId || "",
      qualification: profile?.qualification || "",
      experience: profile?.experience ?? "",
    });

    setShowEdit(true);
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          department: formData.department.trim(),
          designation: formData.designation.trim(),
          employeeId: formData.employeeId.trim(),
          qualification: formData.qualification.trim(),
          experience: formData.experience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile"
        );
      }

      setProfile(data.user);

      setFormData({
        name: data.user.name || "",
        department: data.user.department || "",
        designation: data.user.designation || "",
        employeeId: data.user.employeeId || "",
        qualification: data.user.qualification || "",
        experience: data.user.experience ?? "",
      });

      setShowEdit(false);

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Update profile error:", error);

      setError(
        error.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PROFILE ITEMS
  // =========================================================

  const profileItems = [
    {
      label: "Full Name",
      value: profile?.name,
      icon: User,
    },
    {
      label: "Email Address",
      value: profile?.email,
      icon: Mail,
    },
    {
      label: "Department",
      value: profile?.department,
      icon: Building2,
    },
    {
      label: "Designation",
      value: profile?.designation,
      icon: BriefcaseBusiness,
    },
    {
      label: "Employee ID",
      value: profile?.employeeId,
      icon: BadgeCheck,
    },
    {
      label: "Qualification",
      value: profile?.qualification,
      icon: GraduationCap,
    },
    {
      label: "Experience",
      value:
        profile?.experience !== undefined &&
        profile?.experience !== null &&
        profile?.experience !== ""
          ? `${profile.experience} years`
          : "Not provided",
      icon: Clock3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <MentorSidebar />

      <main className="min-h-screen w-full md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <User size={24} />
                </div>

                <div>
                  <h1 className="text-2xl font-semibold">
                    My Profile
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    View and manage your mentor profile
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  navigate("/mentor/dashboard")
                }
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06]"
              >
                <ArrowLeft size={17} />
                Dashboard
              </button>

              <button
                onClick={fetchProfile}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>

              <button
                onClick={handleEdit}
                disabled={!profile}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
              {success}
            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <RefreshCw
                size={30}
                className="animate-spin text-blue-400"
              />
            </div>
          ) : profile ? (
            <div className="space-y-6">

              {/* =================================================
                  PROFILE HERO
              ================================================= */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-3xl font-bold text-white">
                    {profile.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-semibold">
                      {profile.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {profile.designation || "Mentor"}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                        Mentor
                      </span>

                      {profile.isApproved && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  INFORMATION
              ================================================= */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    Personal & Professional Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your registered mentor details
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {profileItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">
                              {item.label}
                            </p>

                            <p className="mt-1 break-words text-sm font-medium text-slate-200">
                              {item.value || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0b1120] px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your professional information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSave}
              className="space-y-5 p-6"
            >

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-500 outline-none"
                />

                <p className="mt-1.5 text-xs text-slate-600">
                  Email address cannot be changed.
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Department */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    placeholder="e.g. Information Technology"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    placeholder="e.g. Software Developer"
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Employee ID
                  </label>

                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    placeholder="Enter employee ID"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Qualification
                  </label>

                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    placeholder="e.g. M.Tech in Computer Science"
                  />
                </div>

                {/* Experience */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Experience (Years)
                  </label>

                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    placeholder="Enter years of experience"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  disabled={saving}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
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
};

export default MentorProfile;