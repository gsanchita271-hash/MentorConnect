import { useEffect, useState } from "react";

import {
  Users,
  Mail,
  BookOpen,
  GraduationCap,
  Hash,
  Loader2,
  UserRound,
} from "lucide-react";

import MentorSidebar from "../components/layout/MentorSidebar.jsx";

function MentorMentees() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ================= FETCH MENTEES =================

  const fetchMentees = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:4000/api/auth/my-mentees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch mentees");
        return;
      }

      setMentees(data.mentees || []);
    } catch (error) {
      console.error(error);
      alert("Server se connect nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentees();
  }, []);

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816]">
        <Loader2
          size={28}
          className="animate-spin text-blue-400"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* ================= SIDEBAR ================= */}

      <MentorSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ================= MAIN CONTENT ================= */}

      <main
        className={`
          min-h-screen
          w-full
          transition-all
          duration-300
          ${
            sidebarCollapsed
              ? "md:ml-20 md:w-[calc(100%-5rem)]"
              : "md:ml-64 md:w-[calc(100%-16rem)]"
          }
        `}
      >

        {/* ================= HEADER ================= */}

        <header className="border-b border-white/10 px-5 py-5 sm:px-8">

          <div className="pl-12 md:pl-0">

            <p className="text-sm text-slate-500">
              Mentor Panel
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              My Mentees
            </h1>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <section className="w-full p-5 sm:p-8">

          {/* PAGE INTRO */}

          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Users size={22} />
              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Your Mentees
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View students assigned to you.
                </p>

              </div>

            </div>

          </div>

          {/* ================= COUNT ================= */}

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Mentees
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {mentees.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Users size={22} />
              </div>

            </div>

          </div>

          {/* ================= EMPTY STATE ================= */}

          {mentees.length === 0 ? (

            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
                <UserRound size={28} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No mentees found
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                There are currently no approved mentees available.
              </p>

            </div>

          ) : (

            /* ================= MENTEE CARDS ================= */

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {mentees.map((mentee) => (

                <div
                  key={mentee._id}
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.025]
                    p-5
                    transition
                    hover:border-blue-500/30
                    hover:bg-white/[0.04]
                  "
                >

                  {/* CARD HEADER */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold">
                      {mentee.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate font-semibold">
                        {mentee.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Mentee
                      </p>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 space-y-3">

                    {/* EMAIL */}

                    <div className="flex items-start gap-3">

                      <Mail
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <div className="min-w-0">

                        <p className="text-xs text-slate-500">
                          Email
                        </p>

                        <p className="mt-0.5 break-all text-sm">
                          {mentee.email || "Not provided"}
                        </p>

                      </div>

                    </div>

                    {/* COURSE */}

                    <div className="flex items-start gap-3">

                      <BookOpen
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <div>

                        <p className="text-xs text-slate-500">
                          Course
                        </p>

                        <p className="mt-0.5 text-sm">
                          {mentee.course || "Not provided"}
                        </p>

                      </div>

                    </div>

                    {/* SEMESTER */}

                    <div className="flex items-start gap-3">

                      <GraduationCap
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <div>

                        <p className="text-xs text-slate-500">
                          Semester
                        </p>

                        <p className="mt-0.5 text-sm">
                          {mentee.semester
                            ? `Semester ${mentee.semester}`
                            : "Not provided"}
                        </p>

                      </div>

                    </div>

                    {/* ROLL NUMBER */}

                    <div className="flex items-start gap-3">

                      <Hash
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <div>

                        <p className="text-xs text-slate-500">
                          Roll Number
                        </p>

                        <p className="mt-0.5 text-sm">
                          {mentee.rollNumber || "Not provided"}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default MentorMentees;