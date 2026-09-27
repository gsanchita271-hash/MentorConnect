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

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    // YOUR DEPLOYED BACKEND API
    const API = "https://mentorconnect-a7c8.onrender.com/api";

    console.log("API URL:", JSON.stringify(API));
    console.log("Login URL:", `${API}/auth/login`);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      console.log("Response status:", response.status);

      // Get response as text first
      const text = await response.text();

      console.log("Server response:", text);

      let data;

      // Convert response to JSON safely
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        console.error("Actual server response:", text);

        alert(
          `Server ne JSON response nahi diya.\nStatus: ${response.status}`
        );

        setLoading(false);
        return;
      }

      console.log("Parsed response:", data);

      // Login failed
      if (!response.ok) {
        alert(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      // Check token
      if (!data.token) {
        alert("Login successful but token nahi mila.");
        console.error("Token missing:", data);
        setLoading(false);
        return;
      }

      // Save login information
      sessionStorage.setItem("token", data.token);

      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      console.log("Login successful:", data);

      alert(data.message || "Login successful!");

      // Redirect according to role
      if (data.user?.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (data.user?.role === "Mentor") {
        navigate("/mentor/dashboard");
      } else if (data.user?.role === "Mentee") {
        navigate("/mentee/dashboard");
      } else {
        alert("Invalid user role.");
      }
    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Backend se connection nahi ho pa raha.\n\nPlease check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <GraduationCap
                size={34}
                className="text-cyan-400"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="text-slate-400 mt-2">
              Login to your MentorConnect account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-not-allowed text-slate-950 font-semibold flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Login
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          {/* Register */}
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Register
              </Link>
            </p>
          </div>

          {/* Admin Approval Info */}
          <div className="mt-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex gap-3">

              <ShieldCheck
                size={20}
                className="text-cyan-400 flex-shrink-0 mt-0.5"
              />

              <div>
                <p className="text-sm font-medium text-slate-200">
                  Account Approval
                </p>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  New Mentor and Mentee accounts require
                  admin approval before login.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 MentorConnect. All rights reserved.
        </p>

      </div>

    </div>
  );
}

export default Login;