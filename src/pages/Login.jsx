import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get backend API URL from Vercel/Vite environment variable
    const API = import.meta.env.VITE_API_URL;

    console.log("API URL:", API);

    if (!API) {
      alert("API URL is not configured.");
      console.error("VITE_API_URL is missing.");
      return;
    }

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save JWT token
      sessionStorage.setItem("token", data.token);

      // Save user information
      sessionStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert(data.message || "Login successful");

      // Role-based navigation
      if (data.user.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "Mentor") {
        navigate("/mentor/dashboard");
      } else if (data.user.role === "Mentee") {
        navigate("/mentee/dashboard");
      } else {
        alert("Invalid user role.");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Server se connect nahi ho pa raha.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] px-5 py-8 text-white sm:px-6">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute left-1/2 top-[-180px] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[130px]" />

        <div className="absolute bottom-[-150px] left-[-100px] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]" />

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

      {/* Login */}
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center py-10">

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-8 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">

              <GraduationCap size={24} />

            </div>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Login to continue to your MentorConnect account.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8"
          >

            {/* Email */}
            <div>

              <label className="text-sm font-medium text-slate-300">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />

            </div>

            {/* Password */}
            <div className="mt-5">

              <div className="flex items-center justify-between">

                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs text-blue-400 transition hover:text-blue-300"
                  onClick={() =>
                    alert(
                      "Forgot password will be connected with the backend later."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative mt-2">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Approval notice */}
            <div className="mt-6 flex gap-3 rounded-xl border border-blue-400/10 bg-blue-500/[0.04] p-4">

              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-blue-400"
              />

              <p className="text-xs leading-5 text-slate-500">
                Your account must be approved by the college admin before
                you can access MentorConnect.
              </p>

            </div>

            {/* Login button */}
            <button
              type="submit"
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Login

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />

            </button>

            {/* Register */}
            <p className="mt-6 text-center text-sm text-slate-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Register
              </Link>

            </p>

          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-600">
            Secure access for MentorConnect users
          </p>

        </div>

      </main>

    </div>
  );
}

export default Login;