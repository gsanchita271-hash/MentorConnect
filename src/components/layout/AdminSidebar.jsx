import {
  LayoutDashboard,
  UserCheck,
  Users,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Pending Approvals",
      path: "/admin/dashboard#approvals",
      icon: UserCheck,
    },
    {
      name: "Mentors",
      path: "/admin/dashboard#mentors",
      icon: Users,
    },
    {
      name: "Mentees",
      path: "/admin/dashboard#mentees",
      icon: Users,
    },
    {
      name: "Assign Mentees",
      path: "/admin/dashboard#assign",
      icon: UserPlus,
    },
  ];

  const handleNavigation = (path) => {
    setMobileOpen(false);

    if (path.includes("#")) {
      const [basePath, hash] = path.split("#");

      if (window.location.pathname === basePath) {
        setTimeout(() => {
          document
            .getElementById(hash)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 50);

        window.history.replaceState(
          null,
          "",
          `${basePath}#${hash}`
        );
      } else {
        navigate(path);
      }

      return;
    }

    navigate(path);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <>
      {/* MOBILE HEADER */}

      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden">

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Users size={20} />
          </div>

          <span className="font-semibold text-white">
            Admin Panel
          </span>

        </div>

        <button
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800"
        >
          {mobileOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

      </div>

      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          flex-col
          border-r
          border-zinc-800
          bg-zinc-950
          transition-all
          duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        {/* LOGO */}

        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">

          {!collapsed ? (
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                <Users size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  MentorConnect
                </p>

                <p className="text-xs text-zinc-500">
                  Admin Panel
                </p>
              </div>

            </div>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Users size={20} />
            </div>
          )}

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-2 overflow-y-auto p-3">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const isDashboard =
              item.path === "/admin/dashboard";

            const isActive =
              isDashboard &&
              window.location.pathname ===
                "/admin/dashboard" &&
              !window.location.hash;

            return (
              <button
                key={item.path}
                onClick={() =>
                  handleNavigation(item.path)
                }
                className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  transition
                  ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }
                `}
              >

                <Icon
                  size={20}
                  className="shrink-0"
                />

                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                )}

              </button>
            );
          })}

        </nav>

        {/* BOTTOM */}

        <div className="border-t border-zinc-800 p-3">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={20} />

            {!collapsed && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}
          </button>

          <button
            onClick={() =>
              setCollapsed(!collapsed)
            }
            className="mt-2 hidden w-full items-center justify-center rounded-xl border border-zinc-800 py-2 text-zinc-500 hover:bg-zinc-900 hover:text-white md:flex"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

        </div>

      </aside>
    </>
  );
}

export default AdminSidebar;