import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  ShieldCheck,
  GraduationCap,
  CalendarDays,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Menu,
  X,
  UserRoundCheck,
} from "lucide-react";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />

        <div className="absolute right-[-150px] top-[45%] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute left-[-150px] top-[70%] h-[300px] w-[300px] rounded-full bg-blue-700/10 blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
              <GraduationCap size={21} />
            </div>

            <div>
              <h1 className="text-sm font-bold sm:text-base">
                MentorConnect
              </h1>

              <p className="text-[10px] text-slate-500 sm:text-xs">
                College Mentorship
              </p>
            </div>

          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 md:flex">

            <a
              href="#features"
              className="text-sm text-slate-400 transition hover:text-blue-400"
            >
              Features
            </a>

            <a
              href="#roles"
              className="text-sm text-slate-400 transition hover:text-blue-400"
            >
              Roles
            </a>

            <a
              href="#workflow"
              className="text-sm text-slate-400 transition hover:text-blue-400"
            >
              How it works
            </a>

          </div>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-2 sm:gap-3 md:flex">

            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Register
            </Link>

          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 p-2 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#050816] px-5 py-5 md:hidden">

            <div className="flex flex-col gap-4">

              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-slate-300"
              >
                Features
              </a>

              <a
                href="#roles"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-slate-300"
              >
                Roles
              </a>

              <a
                href="#workflow"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-slate-300"
              >
                How it works
              </a>

              <div className="mt-2 flex gap-3">

                <Link
                  to="/login"
                  className="flex-1 rounded-lg border border-white/10 py-2.5 text-center text-sm"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium"
                >
                  Register
                </Link>

              </div>

            </div>

          </div>
        )}
      </nav>

      {/* HERO */}
      <main className="relative z-10">

        <section className="px-5 pb-20 pt-36 sm:px-6 sm:pt-40">

          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300 sm:text-sm">

              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />

              Smart College Mentorship Platform

            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">

              Empowering students through

              <span className="mt-2 block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                better mentorship.
              </span>

            </h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8 lg:text-lg">

              MentorConnect brings students, mentors and college
              administration together in one organized digital platform
              for better communication, progress tracking and support.

            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 sm:text-base"
              >
                Get Started

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />

              </Link>

              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10 sm:text-base"
              >
                Login
              </Link>

            </div>

            {/* Small trust points */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs text-slate-500 sm:text-sm">

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-blue-400" />
                Organized records
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-blue-400" />
                Role-based access
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-blue-400" />
                Admin approval
              </span>

            </div>

          </div>

        </section>

        {/* ROLES */}
        <section
          id="roles"
          className="border-t border-white/[0.06] px-5 py-20 sm:px-6"
        >

          <div className="mx-auto max-w-6xl">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Built for every role
              </p>

              <h3 className="mt-3 text-3xl font-bold sm:text-4xl">
                One platform. Three experiences.
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Each user gets access to the tools and information relevant
                to their role.
              </p>

            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <RoleCard
                icon={<ShieldCheck />}
                title="Admin"
                text="Manage users, approvals and the overall mentorship system."
              />

              <RoleCard
                icon={<UserRoundCheck />}
                title="Mentor"
                text="Manage assigned students, meetings, progress and feedback."
              />

              <RoleCard
                icon={<GraduationCap />}
                title="Mentee"
                text="View progress, tasks, meetings and communicate with mentors."
              />

            </div>

          </div>

        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="border-t border-white/[0.06] px-5 py-20 sm:px-6"
        >

          <div className="mx-auto max-w-6xl">

            <div className="max-w-2xl">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Features
              </p>

              <h3 className="mt-3 text-3xl font-bold sm:text-4xl">
                Everything in one place.
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Replace scattered records and manual processes with a
                centralized mentorship system.
              </p>

            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <FeatureCard
                icon={<Users />}
                title="Student Management"
                text="Maintain organized student profiles and mentor assignments."
              />

              <FeatureCard
                icon={<CalendarDays />}
                title="Meetings"
                text="Schedule meetings and keep track of discussions."
              />

              <FeatureCard
                icon={<BarChart3 />}
                title="Progress"
                text="Track academic progress, attendance, tasks and goals."
              />

              <FeatureCard
                icon={<MessageSquare />}
                title="Communication"
                text="Manage announcements, feedback and concerns."
              />

            </div>

          </div>

        </section>

        {/* WORKFLOW */}
        <section
          id="workflow"
          className="border-t border-white/[0.06] px-5 py-20 sm:px-6"
        >

          <div className="mx-auto max-w-6xl">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Simple workflow
              </p>

              <h3 className="mt-3 text-3xl font-bold sm:text-4xl">
                How MentorConnect works
              </h3>

            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">

              <Step
                number="01"
                title="Register"
                text="Create your account and submit your details."
              />

              <Step
                number="02"
                title="Admin approval"
                text="The admin reviews your registration before access is granted."
              />

              <Step
                number="03"
                title="Start mentoring"
                text="Access your role-based dashboard and begin."
              />

            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="px-5 py-20 sm:px-6">

          <div className="mx-auto max-w-5xl">

            <div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/15 via-blue-500/5 to-cyan-500/10 px-6 py-12 text-center sm:px-12 sm:py-16">

              <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[90px]" />

              <div className="relative">

                <h3 className="text-3xl font-bold sm:text-4xl">
                  Ready to connect?
                </h3>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  Create your account and become part of a more organized
                  mentorship experience.
                </p>

                <Link
                  to="/register"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Create Account
                  <ArrowRight size={18} />
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-6">

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <GraduationCap size={17} />
            </div>

            <span className="text-sm font-semibold">
              MentorConnect
            </span>

          </div>

          <p className="text-xs text-slate-600">
            College Mentor-Mentee Management System
          </p>

          <p className="text-xs text-slate-600">
            © 2026 MentorConnect
          </p>

        </div>

      </footer>

    </div>
  );
}


/* ROLE CARD */
function RoleCard({ icon, title, text }) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/[0.05]">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
        {icon}
      </div>

      <h4 className="mt-5 text-lg font-semibold">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}


/* FEATURE CARD */
function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-400/25 hover:bg-blue-500/[0.04]">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <h4 className="mt-4 text-sm font-semibold sm:text-base">
        {title}
      </h4>

      <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
        {text}
      </p>

    </div>
  );
}


/* WORKFLOW */
function Step({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">

      <span className="text-sm font-bold text-blue-400">
        {number}
      </span>

      <h4 className="mt-4 text-lg font-semibold">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}

export default Home;