import { useEffect, useState } from "react";

import {
  Users,
  UserCheck,
  UserRound,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Loader2,
  ChevronDown,
  ChevronRight,
  UsersRound,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
} from "lucide-react";

import AdminSidebar from "../components/layout/AdminSidebar.jsx";

const API_URL = "http://localhost:4000/api";

function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [menteeGroups, setMenteeGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedMentees, setSelectedMentees] = useState([]);

  const [openGroups, setOpenGroups] = useState({});

  const [searchMentor, setSearchMentor] = useState("");
  const [searchMentee, setSearchMentee] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    employeeId: "",
    qualification: "",
    experience: "",
    course: "",
    division: "",
    semester: "",
    rollNumber: "",
    ern: "",
  });

  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const [pendingResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/auth/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const pendingData = await pendingResponse.json();
      const usersData = await usersResponse.json();

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData.message || "Failed to fetch pending users"
        );
      }

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message || "Failed to fetch users"
        );
      }

      setPendingUsers(pendingData.users || []);
      setAllUsers(usersData.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      alert(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH GROUPS
  // =========================

  const fetchMenteeGroups = async () => {
    try {
      setGroupsLoading(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/auth/mentee-groups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch mentee groups"
        );
      }

      setMenteeGroups(data.groups || []);
    } catch (error) {
      console.error("Groups error:", error);
      alert(error.message || "Failed to fetch mentee groups");
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMenteeGroups();
  }, []);

  // =========================
  // APPROVE USER
  // =========================

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/auth/approve/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Approval failed");
      }

      alert("User approved successfully.");

      await fetchUsers();
      await fetchMenteeGroups();
    } catch (error) {
      console.error(error);
      alert(error.message || "Approval failed");
    } finally {
      setActionLoading("");
    }
  };

  // =========================
  // REJECT USER
  // =========================

  const handleReject = async (id) => {
    const confirmed = window.confirm(
      "Reject this registration? The pending account will be deleted."
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/auth/reject/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Rejection failed");
      }

      alert("User rejected successfully.");

      await fetchUsers();
      await fetchMenteeGroups();
    } catch (error) {
      console.error(error);
      alert(error.message || "Rejection failed");
    } finally {
      setActionLoading("");
    }
  };

  // =========================
  // DELETE APPROVED USER
  // =========================

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Remove ${user.name} from MentorConnect?\n\nThis will permanently delete the account.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(user._id);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/auth/users/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete user"
        );
      }

      alert("User removed successfully.");

      setAllUsers((prev) =>
        prev.filter((item) => item._id !== user._id)
      );

      setSelectedMentees((prev) =>
        prev.filter((id) => id !== user._id)
      );

      await fetchMenteeGroups();
    } catch (error) {
      console.error("Delete user error:", error);
      alert(error.message || "Failed to delete user");
    } finally {
      setActionLoading("");
    }
  };

  // =========================
  // EDIT USER
  // =========================

  const openEditModal = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user.name || "",
      email: user.email || "",

      department: user.department || "",
      designation: user.designation || "",
      employeeId: user.employeeId || "",
      qualification: user.qualification || "",
      experience: user.experience || "",

      course: user.course || "",
      division: user.division || "",
      semester: user.semester ?? "",
      rollNumber: user.rollNumber || "",
      ern: user.ern || "",
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);

    setEditForm({
      name: "",
      email: "",
      department: "",
      designation: "",
      employeeId: "",
      qualification: "",
      experience: "",
      course: "",
      division: "",
      semester: "",
      rollNumber: "",
      ern: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setActionLoading(editingUser._id);

      const token = sessionStorage.getItem("token");

      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      };

      if (editingUser.role === "Mentor") {
        payload.department = editForm.department.trim();
        payload.designation = editForm.designation.trim();
        payload.employeeId = editForm.employeeId.trim();
        payload.qualification = editForm.qualification.trim();
        payload.experience = editForm.experience.trim();
      }

      if (editingUser.role === "Mentee") {
        payload.course = editForm.course.trim();
        payload.division = editForm.division.trim();
        payload.semester = Number(editForm.semester);
        payload.rollNumber = editForm.rollNumber.trim();
        payload.ern = editForm.ern.trim().toUpperCase();
      }

      const response = await fetch(
        `${API_URL}/auth/users/${editingUser._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update user"
        );
      }

      alert("User updated successfully.");

      setAllUsers((prev) =>
        prev.map((item) =>
          item._id === editingUser._id
            ? data.user
            : item
        )
      );

      closeEditModal();

      await fetchMenteeGroups();
    } catch (error) {
      console.error("Update user error:", error);
      alert(error.message || "Failed to update user");
    } finally {
      setActionLoading("");
    }
  };

  // =========================
  // GROUP TOGGLE
  // =========================

  const toggleGroup = (index) => {
    setOpenGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // =========================
  // SELECT MENTEE
  // =========================

  const toggleMentee = (id) => {
    setSelectedMentees((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  // =========================
  // SELECT GROUP
  // =========================

  const toggleGroupSelection = (group) => {
    const ids = group.students.map(
      (student) => student._id
    );

    const allSelected = ids.every((id) =>
      selectedMentees.includes(id)
    );

    if (allSelected) {
      setSelectedMentees((prev) =>
        prev.filter((id) => !ids.includes(id))
      );
    } else {
      setSelectedMentees((prev) =>
        Array.from(new Set([...prev, ...ids]))
      );
    }
  };

  // =========================
  // ASSIGN MENTEES
  // =========================

  const handleAssignMentees = async () => {
    if (!selectedMentor) {
      alert("Please select a mentor.");
      return;
    }

    if (selectedMentees.length === 0) {
      alert("Please select at least one mentee.");
      return;
    }

    try {
      setAssigning(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/auth/assign-mentees`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mentorId: selectedMentor,
            menteeIds: selectedMentees,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to assign mentees"
        );
      }

      alert(
        data.message ||
          "Mentees assigned successfully."
      );

      setSelectedMentor("");
      setSelectedMentees([]);

      await fetchUsers();
      await fetchMenteeGroups();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to assign mentees");
    } finally {
      setAssigning(false);
    }
  };

  // =========================
  // COUNTS
  // =========================

  const totalUsers = allUsers.length;

  const totalMentors = allUsers.filter(
    (user) => user.role === "Mentor"
  ).length;

  const totalMentees = allUsers.filter(
    (user) => user.role === "Mentee"
  ).length;

  const pendingCount = pendingUsers.length;

  const approvedMentors = allUsers.filter(
    (user) =>
      user.role === "Mentor" &&
      user.isApproved
  );

  const approvedMentees = allUsers.filter(
    (user) =>
      user.role === "Mentee" &&
      user.isApproved
  );

  const filteredMentors = approvedMentors.filter(
    (mentor) => {
      const value =
        `${mentor.name} ${mentor.email} ${
          mentor.department || ""
        } ${mentor.designation || ""}`.toLowerCase();

      return value.includes(
        searchMentor.toLowerCase()
      );
    }
  );

  const filteredMentees = approvedMentees.filter(
    (mentee) => {
      const value =
        `${mentee.name} ${mentee.email} ${
          mentee.course || ""
        } ${mentee.division || ""} ${
          mentee.rollNumber || ""
        } ${mentee.ern || ""}`.toLowerCase();

      return value.includes(
        searchMentee.toLowerCase()
      );
    }
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816]">
        <Loader2
          size={30}
          className="animate-spin text-blue-400"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

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

        {/* HEADER */}

        <header className="border-b border-white/10 px-5 py-5 sm:px-8">
          <div className="pl-12 md:pl-0">
            <p className="text-sm text-slate-500">
              Administration Panel
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Admin Dashboard
            </h1>
          </div>
        </header>

        <section className="w-full p-5 sm:p-8">

          {/* WELCOME */}

          <div className="mb-8">
            <h2 className="text-xl font-semibold">
              Welcome, Admin 👋
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage users, approvals and
              mentor-mentee assignments.
            </p>
          </div>

          {/* STATS */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={<Users size={21} />}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <StatCard
              title="Total Mentors"
              value={totalMentors}
              icon={<UserCheck size={21} />}
              iconClass="bg-purple-500/10 text-purple-400"
            />

            <StatCard
              title="Total Mentees"
              value={totalMentees}
              icon={<UserRound size={21} />}
              iconClass="bg-cyan-500/10 text-cyan-400"
            />

            <StatCard
              title="Pending Approval"
              value={pendingCount}
              icon={<Clock size={21} />}
              iconClass="bg-yellow-500/10 text-yellow-400"
            />

          </div>

          {/* ================= PENDING ================= */}

          <section
            id="approvals"
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025]"
          >

            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <Clock
                  size={20}
                  className="text-yellow-400"
                />

                <div>
                  <h2 className="text-lg font-semibold">
                    Pending Approvals
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Approve or reject new registrations.
                  </p>
                </div>
              </div>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center p-8 text-center">
                <CheckCircle
                  size={35}
                  className="text-green-400"
                />

                <p className="mt-4 font-medium">
                  No pending approvals
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">

                {pendingUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 font-semibold text-blue-400">
                        {user.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {user.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {user.email}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">

                          <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                            {user.role}
                          </span>

                          {user.role === "Mentee" && (
                            <span className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-400">
                              {user.course || "Course N/A"}{" "}
                              •{" "}
                              {user.division || "Division N/A"}
                            </span>
                          )}

                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">

                      <button
                        onClick={() =>
                          handleApprove(user._id)
                        }
                        disabled={
                          actionLoading === user._id
                        }
                        className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
                      >
                        {actionLoading === user._id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle size={16} />
                        )}

                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleReject(user._id)
                        }
                        disabled={
                          actionLoading === user._id
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </section>

          {/* ================= ASSIGN ================= */}

          <section
            id="assign"
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >

            <div className="mb-6 flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <UsersRound size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Assign Mentees
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select students by Course and Division,
                  then assign them to a mentor.
                </p>
              </div>

            </div>

            {/* MENTOR */}

            <label className="mb-2 block text-sm text-slate-300">
              Select Mentor
            </label>

            <select
              value={selectedMentor}
              onChange={(e) =>
                setSelectedMentor(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Select Mentor
              </option>

              {approvedMentors.map((mentor) => (
                <option
                  key={mentor._id}
                  value={mentor._id}
                >
                  {mentor.name}
                </option>
              ))}
            </select>

            {/* GROUPS */}

            <div className="mt-6">

              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Mentee Groups
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Course + Division
                  </p>
                </div>

                <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400">
                  {selectedMentees.length} selected
                </span>
              </div>

              {groupsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2
                    size={22}
                    className="animate-spin text-blue-400"
                  />
                </div>
              ) : menteeGroups.length === 0 ? (
                <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-slate-500">
                  No mentee groups found.
                </div>
              ) : (
                <div className="space-y-3">

                  {menteeGroups.map(
                    (group, groupIndex) => {

                      const ids =
                        group.students.map(
                          (student) => student._id
                        );

                      const selectedCount =
                        ids.filter((id) =>
                          selectedMentees.includes(id)
                        ).length;

                      const allSelected =
                        ids.length > 0 &&
                        selectedCount === ids.length;

                      return (
                        <div
                          key={`${group.course}-${group.division}-${groupIndex}`}
                          className="overflow-hidden rounded-xl border border-white/10 bg-black/10"
                        >

                          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                              <button
                                onClick={() =>
                                  toggleGroup(groupIndex)
                                }
                                className="text-slate-400 hover:text-white"
                              >
                                {openGroups[groupIndex] ? (
                                  <ChevronDown size={19} />
                                ) : (
                                  <ChevronRight size={19} />
                                )}
                              </button>

                              <div>
                                <h4 className="font-medium">
                                  {group.course} -{" "}
                                  {group.division}
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                  {group.students.length} students
                                  {selectedCount > 0 &&
                                    ` • ${selectedCount} selected`}
                                </p>
                              </div>

                            </div>

                            <button
                              onClick={() =>
                                toggleGroupSelection(group)
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                                allSelected
                                  ? "bg-blue-600 text-white"
                                  : "border border-white/10 bg-white/5 text-slate-300"
                              }`}
                            >
                              {allSelected
                                ? "Deselect Group"
                                : "Select Group"}
                            </button>

                          </div>

                          {openGroups[groupIndex] && (
                            <div className="border-t border-white/10">

                              {group.students.map(
                                (student) => (
                                  <label
                                    key={student._id}
                                    className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-5 py-3 last:border-0 hover:bg-white/[0.025]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedMentees.includes(
                                        student._id
                                      )}
                                      onChange={() =>
                                        toggleMentee(
                                          student._id
                                        )
                                      }
                                      className="h-4 w-4 accent-blue-600"
                                    />

                                    <div>
                                      <p className="text-sm font-medium">
                                        {student.name}
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        Roll:{" "}
                                        {student.rollNumber ||
                                          "N/A"}{" "}
                                        • Semester{" "}
                                        {student.semester ||
                                          "N/A"}
                                      </p>
                                    </div>
                                  </label>
                                )
                              )}

                            </div>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            <button
              onClick={handleAssignMentees}
              disabled={
                assigning ||
                !selectedMentor ||
                selectedMentees.length === 0
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-40"
            >
              {assigning ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Assign {selectedMentees.length} Mentee
                  {selectedMentees.length !== 1 ? "s" : ""}
                </>
              )}
            </button>

          </section>

          {/* ================= MENTORS ================= */}

          <section
            id="mentors"
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025]"
          >

            <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  All Mentors
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Edit or remove approved mentors.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={searchMentor}
                  onChange={(e) =>
                    setSearchMentor(e.target.value)
                  }
                  placeholder="Search mentor..."
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
                />
              </div>

            </div>

            {filteredMentors.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No mentors found.
              </div>
            ) : (
              <div className="divide-y divide-white/10">

                {filteredMentors.map((mentor) => (
                  <UserRow
                    key={mentor._id}
                    user={mentor}
                    onEdit={openEditModal}
                    onDelete={handleDeleteUser}
                    actionLoading={actionLoading}
                  />
                ))}

              </div>
            )}

          </section>

          {/* ================= MENTEES ================= */}

          <section
            id="mentees"
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025]"
          >

            <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  All Mentees
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Edit or remove approved mentees.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={searchMentee}
                  onChange={(e) =>
                    setSearchMentee(e.target.value)
                  }
                  placeholder="Search mentee..."
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
                />
              </div>

            </div>

            {filteredMentees.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No mentees found.
              </div>
            ) : (
              <div className="divide-y divide-white/10">

                {filteredMentees.map((mentee) => (
                  <UserRow
                    key={mentee._id}
                    user={mentee}
                    onEdit={openEditModal}
                    onDelete={handleDeleteUser}
                    actionLoading={actionLoading}
                  />
                ))}

              </div>
            )}

          </section>

        </section>
      </main>

      {/* ================= EDIT MODAL ================= */}

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1020] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1020] p-5">

              <div>
                <h2 className="text-lg font-semibold">
                  Edit {editingUser.role}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update account information.
                </p>
              </div>

              <button
                onClick={closeEditModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">

              <EditInput
                label="Name"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
              />

              <EditInput
                label="Email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
              />

              {editingUser.role === "Mentor" && (
                <>
                  <EditInput
                    label="Department"
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="Designation"
                    name="designation"
                    value={editForm.designation}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="Employee ID"
                    name="employeeId"
                    value={editForm.employeeId}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="Qualification"
                    name="qualification"
                    value={editForm.qualification}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="Experience"
                    name="experience"
                    value={editForm.experience}
                    onChange={handleEditChange}
                  />
                </>
              )}

              {editingUser.role === "Mentee" && (
                <>
                  <EditInput
                    label="Course"
                    name="course"
                    value={editForm.course}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="Division"
                    name="division"
                    value={editForm.division}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="Semester"
                    name="semester"
                    type="number"
                    min="1"
                    value={editForm.semester}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="Roll Number"
                    name="rollNumber"
                    value={editForm.rollNumber}
                    onChange={handleEditChange}
                  />

                  <EditInput
                    label="ERN"
                    name="ern"
                    value={editForm.ern}
                    onChange={handleEditChange}
                  />
                </>
              )}

            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 p-5">

              <button
                onClick={closeEditModal}
                disabled={actionLoading === editingUser._id}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateUser}
                disabled={
                  actionLoading === editingUser._id
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >

                {actionLoading === editingUser._id ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// =========================
// STAT CARD
// =========================

function StatCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

// =========================
// USER ROW
// =========================

function UserRow({
  user,
  onEdit,
  onDelete,
  actionLoading,
}) {
  const isMentor = user.role === "Mentor";

  return (
    <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">

      <div className="flex min-w-0 items-center gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-semibold ${
            isMentor
              ? "bg-purple-500/10 text-purple-400"
              : "bg-cyan-500/10 text-cyan-400"
          }`}
        >
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">

          <h3 className="font-semibold">
            {user.name}
          </h3>

          <p className="mt-1 break-all text-sm text-slate-500">
            {user.email}
          </p>

          {isMentor ? (
            <div className="mt-2 text-xs text-slate-400">
              {user.department || "Department N/A"}
              {" • "}
              {user.designation || "Designation N/A"}
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">

              <span>
                {user.course || "Course N/A"}
              </span>

              <span>•</span>

              <span>
                Division {user.division || "N/A"}
              </span>

              <span>•</span>

              <span>
                Semester {user.semester || "N/A"}
              </span>

              <span>•</span>

              <span>
                Roll {user.rollNumber || "N/A"}
              </span>

            </div>
          )}

        </div>
      </div>

      <div className="flex shrink-0 gap-2">

        <button
          onClick={() => onEdit(user)}
          className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/20"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          onClick={() => onDelete(user)}
          disabled={actionLoading === user._id}
          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
        >
          {actionLoading === user._id ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={16} />
          )}

          Remove
        </button>

      </div>

    </div>
  );
}

// =========================
// EDIT INPUT
// =========================

function EditInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
      />
    </div>
  );
}

export default AdminDashboard;