import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  CalendarDays,
  UserRound,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const MenteeAcademic = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAcademic = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Login session expired. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/academic/mentee-academic`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to fetch academic records (${response.status})`
        );
      }

      setRecords(
        Array.isArray(data.records) ? data.records : []
      );
    } catch (err) {
      console.error("Academic fetch error:", err);

      setError(
        err.message || "Failed to load academic records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademic();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={32}
              className="animate-spin text-blue-400"
            />

            <p className="text-sm text-white/50">
              Loading academic records...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white p-4 md:p-6">

      {/* HEADER */}
      <div className="mb-7 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
          <GraduationCap size={26} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Academic Progress
          </h1>

          <p className="mt-1 text-sm text-white/45">
            View your semester-wise academic performance
          </p>
        </div>
      </div>


      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={19} />

          <span>{error}</span>
        </div>
      )}


      {/* EMPTY */}
      {!error && records.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <GraduationCap size={28} />
          </div>

          <h2 className="text-lg font-semibold">
            No academic records yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
            Your mentor has not added any academic result yet.
            Once your result is uploaded and confirmed, it will appear here.
          </p>
        </div>
      )}


      {/* RECORDS */}
      {records.length > 0 && (
        <div className="space-y-6">

          {records.map((record, recordIndex) => (
            <AcademicCard
              key={record._id || recordIndex}
              record={record}
              formatDate={formatDate}
            />
          ))}

        </div>
      )}
    </div>
  );
};


/* =========================================================
   ACADEMIC CARD
========================================================= */

const AcademicCard = ({
  record,
  formatDate,
}) => {
  const subjects = Array.isArray(record.subjects)
    ? record.subjects
    : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

      {/* CARD HEADER */}
      <div className="border-b border-white/10 p-5">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <BookOpen size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Semester {record.semester}
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Result declared on{" "}
                {formatDate(record.resultDeclaredOn)}
              </p>
            </div>
          </div>


          {/* RESULT BADGE */}
          {record.result && (
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                String(record.result).toUpperCase() === "PASS"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  String(record.result).toUpperCase() === "PASS"
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />

              {record.result}
            </div>
          )}
        </div>
      </div>


      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-5">

        <SummaryItem
          icon={<TrendingUp size={17} />}
          label="SGPA"
          value={
            record.sgpa !== null &&
            record.sgpa !== undefined
              ? record.sgpa
              : "-"
          }
        />

        <SummaryItem
          icon={<TrendingUp size={17} />}
          label="CGPA"
          value={
            record.cgpa !== null &&
            record.cgpa !== undefined
              ? record.cgpa
              : "-"
          }
        />

        <SummaryItem
          icon={<Award size={17} />}
          label="Overall Grade"
          value={
            record.overallGrade || "-"
          }
        />

        <SummaryItem
          icon={<BookOpen size={17} />}
          label="Grand Total"
          value={
            record.grandTotal !== null &&
            record.grandTotal !== undefined
              ? record.maximumMarks
                ? `${record.grandTotal}/${record.maximumMarks}`
                : record.grandTotal
              : "-"
          }
        />

        <SummaryItem
          icon={<CalendarDays size={17} />}
          label="Semester"
          value={
            record.semester || "-"
          }
        />
      </div>


      {/* SUBJECTS */}
      <div className="p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h3 className="text-base font-semibold">
              Subjects
            </h3>

            <p className="mt-1 text-xs text-white/40">
              {subjects.length} subject
              {subjects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>


        {subjects.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center text-sm text-white/40">
            No subject details available.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">

            <table className="w-full min-w-[850px] text-left">

              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Subject
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Code
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Internal
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    SEE
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Total
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Grade
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    GP
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Credits
                  </th>
                </tr>
              </thead>


              <tbody>

                {subjects.map(
                  (subject, index) => (
                    <tr
                      key={
                        subject._id ||
                        index
                      }
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >

                      <td className="px-4 py-4">

                        <div className="max-w-[280px]">

                          <p className="text-sm font-medium text-white">
                            {subject.subjectName ||
                              "-" }
                          </p>
                        </div>
                      </td>


                      <td className="px-4 py-4 text-sm text-white/50">
                        {subject.code || "-"}
                      </td>


                      <td className="px-4 py-4 text-sm text-white/70">
                        {displayValue(
                          subject.internalMarks
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm text-white/70">
                        {displayValue(
                          subject.seeMarks
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm font-medium text-white">
                        {displayValue(
                          subject.totalMarks
                        )}
                      </td>


                      <td className="px-4 py-4">

                        {subject.grade ? (
                          <span className="inline-flex rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                            {subject.grade}
                          </span>
                        ) : (
                          <span className="text-sm text-white/35">
                            -
                          </span>
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm font-semibold text-white">
                        {displayValue(
                          subject.gradePoint
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm text-white/60">
                        {displayValue(
                          subject.credits
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* MENTOR + REMARKS */}
      <div className="grid gap-4 border-t border-white/10 p-5 md:grid-cols-2">

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">

          <div className="mb-3 flex items-center gap-2 text-white/50">
            <UserRound size={17} />

            <span className="text-xs font-semibold uppercase tracking-wide">
              Mentor
            </span>
          </div>

          {record.mentor ? (
            <div>
              <p className="text-sm font-semibold">
                {record.mentor.name ||
                  "Mentor"}
              </p>

              {record.mentor.designation && (
                <p className="mt-1 text-xs text-white/40">
                  {record.mentor.designation}
                </p>
              )}

              {record.mentor.department && (
                <p className="mt-1 text-xs text-white/40">
                  {record.mentor.department}
                </p>
              )}

              {record.mentor.email && (
                <p className="mt-1 text-xs text-white/40">
                  {record.mentor.email}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/40">
              Mentor information not available.
            </p>
          )}
        </div>


        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">

          <div className="mb-3 flex items-center gap-2 text-white/50">
            <AlertCircle size={17} />

            <span className="text-xs font-semibold uppercase tracking-wide">
              Remarks
            </span>
          </div>

          <p className="text-sm leading-6 text-white/65">
            {record.remarks ||
              "No remarks added."}
          </p>
        </div>

      </div>
    </section>
  );
};


/* =========================================================
   SUMMARY ITEM
========================================================= */

const SummaryItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="bg-[#050816] p-4">

      <div className="mb-2 flex items-center gap-2 text-white/35">
        {icon}

        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
};


/* =========================================================
   DISPLAY VALUE
========================================================= */

const displayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  return value;
};


export default MenteeAcademic;