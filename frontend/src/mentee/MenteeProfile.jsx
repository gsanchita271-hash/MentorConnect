import React, { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  GraduationCap,
  BookOpen,
  Hash,
  IdCard,
  Pencil,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

function MenteeProfile() {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
    division: "",
    semester: "",
    rollNumber: "",
    ern: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // FETCH PROFILE
  // =========================
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        if (contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch profile");
        }

        throw new Error(
          `Server error (${response.status}). Please check backend server.`
        );
      }

      if (!contentType.includes("application/json")) {
        throw new Error(
          "Server returned an invalid response. Make sure backend is running on port 4000."
        );
      }

      const data = await response.json();

      if (!data.user) {
        throw new Error("Profile data not found.");
      }

      setProfile(data.user);

      setForm({
        name: data.user.name || "",
        email: data.user.email || "",
        course: data.user.course || "",
        division: data.user.division || "",
        semester: data.user.semester ?? "",
        rollNumber: data.user.rollNumber || "",
        ern: data.user.ern || "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        course: form.course.trim(),
        division: form.division.trim(),
        semester: Number(form.semester),
        rollNumber: form.rollNumber.trim(),
        ern: form.ern.trim().toUpperCase(),
      };

      if (!payload.name) {
        setError("Name is required.");
        return;
      }

      if (!payload.email) {
        setError("Email is required.");
        return;
      }

      if (!payload.course) {
        setError("Course is required.");
        return;
      }

      if (!payload.division) {
        setError("Division is required.");
        return;
      }

      if (!payload.semester) {
        setError("Semester is required.");
        return;
      }

      if (!payload.rollNumber) {
        setError("Roll number is required.");
        return;
      }

      if (!payload.ern) {
        setError("ERN is required.");
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";

      let data = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error("Non-JSON server response:", text);

        throw new Error(
          `Invalid server response (${response.status}). Backend returned HTML instead of JSON.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update profile"
        );
      }

      setProfile(data.user);

      setForm({
        name: data.user.name || "",
        email: data.user.email || "",
        course: data.user.course || "",
        division: data.user.division || "",
        semester: data.user.semester ?? "",
        rollNumber: data.user.rollNumber || "",
        ern: data.user.ern || "",
      });

      // Update stored user also
      const oldUser = sessionStorage.getItem("user");

      if (oldUser) {
        try {
          const parsedUser = JSON.parse(oldUser);

          sessionStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              ...data.user,
            })
          );
        } catch (error) {
          console.log("Session user update skipped");
        }
      }

      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const handleCancel = () => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      email: profile.email || "",
      course: profile.course || "",
      division: profile.division || "",
      semester: profile.semester ?? "",
      rollNumber: profile.rollNumber || "",
      ern: profile.ern || "",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="min-h-screen bg-[#050816] text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <p className="text-sm text-blue-400 font-medium">
              MentorConnect
            </p>

            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              My Profile
            </h1>

            <p className="text-white/50 text-sm mt-1">
              View and update your personal and academic information.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setEditing(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden">

          {/* PROFILE TOP */}
          <div className="p-6 md:p-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <UserCircle className="w-11 h-11 text-blue-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {profile?.name || "Mentee"}
                </h2>

                <p className="text-white/50 mt-1">
                  {profile?.email}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    Mentee
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${
                      profile?.isApproved
                        ? "bg-green-500/10 text-green-300 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
                    }`}
                  >
                    {profile?.isApproved
                      ? "Approved"
                      : "Pending Approval"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="p-6 md:p-8">

            <h3 className="text-lg font-semibold mb-5">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NAME */}
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!editing}
                icon={<UserCircle className="w-4 h-4" />}
              />

              {/* EMAIL */}
              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={!editing}
                icon={<Mail className="w-4 h-4" />}
              />

              {/* COURSE */}
              <InputField
                label="Course"
                name="course"
                value={form.course}
                onChange={handleChange}
                disabled={!editing}
                icon={<GraduationCap className="w-4 h-4" />}
              />

              {/* DIVISION */}
              <InputField
                label="Division"
                name="division"
                value={form.division}
                onChange={handleChange}
                disabled={!editing}
                icon={<BookOpen className="w-4 h-4" />}
              />

              {/* SEMESTER */}
              <InputField
                label="Semester"
                name="semester"
                type="number"
                min="1"
                value={form.semester}
                onChange={handleChange}
                disabled={!editing}
                icon={<BookOpen className="w-4 h-4" />}
              />

              {/* ROLL NUMBER */}
              <InputField
                label="Roll Number"
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                disabled={!editing}
                icon={<Hash className="w-4 h-4" />}
              />

              {/* ERN */}
              <InputField
                label="ERN"
                name="ern"
                value={form.ern}
                onChange={handleChange}
                disabled={!editing}
                icon={<IdCard className="w-4 h-4" />}
              />

              {/* ROLE */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Role
                </label>

                <div className="h-11 px-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center text-white/70">
                  Mentee
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 md:px-8 py-4 border-t border-white/10 text-xs text-white/40">
            Changes are saved to your MentorConnect account.
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// INPUT COMPONENT
// =========================
function InputField({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  min,
  icon,
}) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          className={`w-full h-11 pl-10 pr-4 rounded-xl border text-sm outline-none transition ${
            disabled
              ? "border-white/10 bg-white/[0.025] text-white/60 cursor-not-allowed"
              : "border-blue-500/30 bg-white/[0.05] text-white focus:border-blue-500"
          }`}
        />
      </div>
    </div>
  );
}

export default MenteeProfile;