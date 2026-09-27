import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardCheck,
  Target,
  MessageSquareWarning,
  Bell,
  BookOpen,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/mentor/dashboard",
  },
  {
    label: "My Mentees",
    icon: Users,
    path: "/mentor/mentees",
  },
  {
    label: "Meetings",
    icon: CalendarDays,
    path: "/mentor/meetings",
  },
  {
    label: "Attendance",
    icon: ClipboardCheck,
    path: "/mentor/attendance",
  },
  {
    label: "Tasks & Goals",
    icon: Target,
    path: "/mentor/tasks",
  },
  {
    label: "Concerns",
    icon: MessageSquareWarning,
    path: "/mentor/concerns",
  },
  {
    label: "Announcements",
    icon: Bell,
    path: "/mentor/announcements",
  },
  {
    label: "Academic Progress",
    icon: BookOpen,
    path: "/mentor/academic",
  },
  {
    label: "Profile",
    icon: UserCircle,
    path: "/mentor/profile",
  },
];

function MentorSidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#050816] px-4 md:hidden">
        <div>
          <h1 className="text-lg font-bold text-white">
            MentorConnect
          </h1>

          <p className="text-[11px] text-slate-500">
            Mentor Panel
          </p>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-300"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-[#050816] transition-transform duration-300 md:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-white/10 px-6 py-5">
          <h1 className="text-xl font-bold text-white">
            MentorConnect
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Mentor Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default MentorSidebar;