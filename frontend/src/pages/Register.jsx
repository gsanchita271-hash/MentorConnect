import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  UserRound,
} from "lucide-react";

function Register() {
  const [role, setRole] = useState("mentee");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Mentor
    department: "",
    designation: "",

    // Mentee
    course: "",
    division: "",
    semester: "",
    rollNumber: "",
    ern: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,

            // Backend expects capitalized role
            role: role === "mentor" ? "Mentor" : "Mentee",

            // Mentor fields
            department: formData.department,
            designation: formData.designation,

            // Mentee fields
            course: formData.course,
            division: formData.division,
            semester: formData.semester,
            rollNumber: formData.rollNumber,
            ern: formData.ern,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert(data.message);
      setSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server se connect nahi ho pa raha.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] px-5 py-8 text-white sm:px-6">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[400px] w-[400px] -translate-x-1/2 -translate-y-0 rounded-full bg-blue-600/15 blur-[130px]" />

        <div className="absolute bottom-[-150px] right-[-100px] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Top */}
      <div className="relative z-10 mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>
      </div>

      {/* Main */}
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center py-10">
        <div className="w-full max-w-xl">

          {/* Heading */}
          <div className="mb-8 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
              <GraduationCap size={24} />
            </div>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Join MentorConnect and become part of a smarter mentorship
              experience.
            </p>
          </div>

          {/* Success */}
          {submitted ? (
            <div className="rounded-3xl border border-blue-400/20 bg-blue-500/[0.05] p-8 text-center shadow-2xl shadow-blue-950/20">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <ShieldCheck size={28} />
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Registration submitted
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                Your account has been submitted for admin approval.
                You will be able to login after your account is approved.
              </p>

              <Link
                to="/login"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                Go to Login
                <ArrowRight size={17} />
              </Link>

            </div>
          ) : (

            /* FORM */
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8"
            >

              {/* Role selection */}
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Register as
                </label>

                <div className="mt-3 grid grid-cols-2 gap-3">

                  {/* Mentee */}
                  <button
                    type="button"
                    onClick={() => setRole("mentee")}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "mentee"
                        ? "border-blue-400/40 bg-blue-500/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <GraduationCap
                      size={20}
                      className={
                        role === "mentee"
                          ? "text-blue-400"
                          : "text-slate-500"
                      }
                    />

                    <p className="mt-3 text-sm font-semibold">
                      Mentee
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Student account
                    </p>
                  </button>

                  {/* Mentor */}
                  <button
                    type="button"
                    onClick={() => setRole("mentor")}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "mentor"
                        ? "border-blue-400/40 bg-blue-500/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <UserRound
                      size={20}
                      className={
                        role === "mentor"
                          ? "text-blue-400"
                          : "text-slate-500"
                      }
                    />

                    <p className="mt-3 text-sm font-semibold">
                      Mentor
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Faculty account
                    </p>
                  </button>

                </div>
              </div>

              {/* Name */}
              <div className="mt-6">
                <label className="text-sm text-slate-300">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="mt-5">
                <label className="text-sm text-slate-300">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* Mentor fields */}
              {role === "mentor" && (
                <>
                  {/* Department */}
                  <div className="mt-5">
                    <label className="text-sm text-slate-300">
                      Department
                    </label>

                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  {/* Designation */}
                  <div className="mt-5">
                    <label className="text-sm text-slate-300">
                      Designation
                    </label>

                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Assistant Professor"
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Mentee fields */}
              {role === "mentee" && (
                <>
                  {/* Course */}
                  <div className="mt-5">
                    <label className="text-sm text-slate-300">
                      Course
                    </label>

                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="e.g. B.Sc. IT"
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  {/* Division */}
                  <div className="mt-5">
                    <label className="text-sm text-slate-300">
                      Division
                    </label>

                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    >
                      <option value="">Select Division</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>

                  {/* Semester + Roll Number */}
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                    {/* Semester */}
                    <div>
                      <label className="text-sm text-slate-300">
                        Semester
                      </label>

                      <input
                        type="number"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        placeholder="e.g. 5"
                        min="1"
                        max="10"
                        required
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
                      />
                    </div>

                    {/* Roll Number */}
                    <div>
                      <label className="text-sm text-slate-300">
                        Roll Number
                      </label>

                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="Enter roll no."
                        required
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
                      />
                    </div>

                  </div>

                  {/* ERN */}
                  <div className="mt-5">
                    <label className="text-sm text-slate-300">
                      ERN Number
                    </label>

                    <input
                      type="text"
                      name="ern"
                      value={formData.ern}
                      onChange={handleChange}
                      placeholder="e.g. MU0341120240114750"
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm uppercase outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Enter your university ERN exactly as mentioned on your
                      result card.
                    </p>
                  </div>
                </>
              )}

              {/* Password */}
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Password */}
                <div>
                  <label className="text-sm text-slate-300">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    required
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm text-slate-300">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>

              </div>

              {/* Notice */}
              <div className="mt-6 flex gap-3 rounded-xl border border-blue-400/10 bg-blue-500/[0.04] p-4">

                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <p className="text-xs leading-5 text-slate-500">
                  New accounts require admin approval before you can login
                  and access MentorConnect.
                </p>

              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Create Account
                <ArrowRight size={17} />
              </button>

              {/* Login */}
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}

                <Link
                  to="/login"
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Login
                </Link>
              </p>

            </form>
          )}

        </div>
      </main>
    </div>
  );
}

export default Register;