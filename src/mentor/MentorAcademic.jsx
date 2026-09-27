import React, { useState } from "react";
import {
  Upload,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Save,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const emptySubject = {
  subjectName: "",
  code: "",
  internalMarks: "",
  seeMarks: "",
  totalMarks: "",
  grade: "",
  gradePoint: "",
  credits: 2,
};

// =========================================================
// RESPONSE PARSER
// =========================================================

const parseResponse = async (response) => {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}). Check backend terminal.`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
};

// =========================================================
// MAIN COMPONENT
// =========================================================

const MentorAcademic = () => {
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [matchedMentee, setMatchedMentee] =
    useState(null);

  const [form, setForm] = useState({
    semester: "",
    sgpa: "",
    cgpa: "",
    grandTotal: "",
    maximumMarks: "",
    result: "",
    overallGrade: "",
    resultDeclaredOn: "",
    remarks: "",
  });

  const [subjects, setSubjects] = useState([]);

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Please upload JPG or PNG result card."
      );
      setFile(null);
      return;
    }

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      setError(
        "File size must be less than 10 MB."
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // =========================================================
  // OCR
  // =========================================================

  const handleOCR = async () => {
    setError("");
    setSuccess("");

    if (!file) {
      setError(
        "Please select a result card first."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login session expired. Please login again."
        );
      }

      const formData = new FormData();

      formData.append(
        "result",
        file
      );

      const response = await fetch(
        `${API_URL}/academic/upload-result`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data =
        await parseResponse(response);

      const extracted =
        data.extractedData || {};

      setMatchedMentee(
        data.matchedMentee || null
      );

      setForm({
        semester:
          extracted.semester ?? "",

        sgpa:
          extracted.sgpa ?? "",

        cgpa:
          extracted.cgpa ?? "",

        grandTotal:
          extracted.grandTotal ?? "",

        maximumMarks:
          extracted.maximumMarks ?? "",

        result:
          extracted.result ?? "",

        overallGrade:
          extracted.overallGrade ?? "",

        resultDeclaredOn:
          extracted.resultDeclaredOn
            ? String(
                extracted.resultDeclaredOn
              ).slice(0, 10)
            : "",

        remarks: "",
      });

      setSubjects(
        Array.isArray(data.subjects)
          ? data.subjects.map(
              (subject) => ({
                ...emptySubject,
                ...subject,

                internalMarks:
                  subject.internalMarks ??
                  "",

                seeMarks:
                  subject.seeMarks ??
                  "",

                totalMarks:
                  subject.totalMarks ??
                  "",

                grade:
                  subject.grade ??
                  "",

                gradePoint:
                  subject.gradePoint ??
                  "",

                credits:
                  subject.credits ??
                  2,
              })
            )
          : []
      );

      setSuccess(
        "Result extracted successfully. Please review and confirm before saving."
      );
    } catch (err) {
      console.error(
        "OCR error:",
        err
      );

      setError(
        err.message ||
          "Failed to extract result."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM UPDATE
  // =========================================================

  const updateForm = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================================
  // SUBJECT UPDATE
  // =========================================================

  const updateSubject = (
    index,
    field,
    value
  ) => {
    setSubjects((prev) =>
      prev.map(
        (subject, i) =>
          i === index
            ? {
                ...subject,
                [field]: value,
              }
            : subject
      )
    );
  };

  // =========================================================
  // ADD SUBJECT
  // =========================================================

  const addSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        ...emptySubject,
      },
    ]);
  };

  // =========================================================
  // REMOVE SUBJECT
  // =========================================================

  const removeSubject = (
    index
  ) => {
    setSubjects((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // =========================================================
  // CONFIRM & SAVE
  // =========================================================

  const handleConfirm = async () => {
    setError("");
    setSuccess("");

    if (!matchedMentee?._id) {
      setError(
        "Mentee is not matched."
      );
      return;
    }

    if (!form.semester) {
      setError(
        "Semester is required."
      );
      return;
    }

    if (subjects.length === 0) {
      setError(
        "At least one subject is required."
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login session expired. Please login again."
        );
      }

      const payload = {
        mentee:
          matchedMentee._id,

        semester: Number(
          form.semester
        ),

        sgpa:
          form.sgpa === ""
            ? null
            : Number(form.sgpa),

        cgpa:
          form.cgpa === ""
            ? null
            : Number(form.cgpa),

        grandTotal:
          form.grandTotal === ""
            ? null
            : Number(
                form.grandTotal
              ),

        maximumMarks:
          form.maximumMarks === ""
            ? null
            : Number(
                form.maximumMarks
              ),

        result:
          form.result,

        overallGrade:
          form.overallGrade,

        resultDeclaredOn:
          form.resultDeclaredOn ||
          null,

        remarks:
          form.remarks,

        subjects:
          subjects.map(
            (subject) => ({
              subjectName:
                subject.subjectName,

              code:
                subject.code || "",

              internalMarks:
                subject.internalMarks ===
                  "" ||
                subject.internalMarks ===
                  null
                  ? null
                  : Number(
                      subject.internalMarks
                    ),

              seeMarks:
                subject.seeMarks ===
                  "" ||
                subject.seeMarks ===
                  null
                  ? null
                  : Number(
                      subject.seeMarks
                    ),

              totalMarks:
                subject.totalMarks ===
                  "" ||
                subject.totalMarks ===
                  null
                  ? null
                  : Number(
                      subject.totalMarks
                    ),

              grade:
                subject.grade || "",

              gradePoint:
                subject.gradePoint ===
                  "" ||
                subject.gradePoint ===
                  null
                  ? null
                  : Number(
                      subject.gradePoint
                    ),

              credits:
                subject.credits ===
                  "" ||
                subject.credits ===
                  null
                  ? 2
                  : Number(
                      subject.credits
                    ),
            })
          ),
      };

      const response = await fetch(
        `${API_URL}/academic/confirm-result`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await parseResponse(
          response
        );

      setSuccess(
        data.message ||
          "Academic result saved successfully."
      );

      // Clear after successful save

      setFile(null);

      setMatchedMentee(null);

      setSubjects([]);

      setForm({
        semester: "",
        sgpa: "",
        cgpa: "",
        grandTotal: "",
        maximumMarks: "",
        result: "",
        overallGrade: "",
        resultDeclaredOn: "",
        remarks: "",
      });
    } catch (err) {
      console.error(
        "Save academic result error:",
        err
      );

      setError(
        err.message ||
          "Failed to save academic result."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#050816] p-4 text-white md:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
          <GraduationCap size={25} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Academic Progress
          </h1>

          <p className="text-sm text-white/50">
            Upload and manage mentee examination results
          </p>
        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">

          <AlertCircle size={18} />

          <span>{error}</span>

        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">

          <CheckCircle2 size={18} />

          <span>{success}</span>

        </div>
      )}

      {/* =====================================================
          UPLOAD
      ===================================================== */}

      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

        <div className="mb-5">

          <h2 className="text-lg font-semibold">
            Upload University Result
          </h2>

          <p className="mt-1 text-sm text-white/45">
            Upload a result card image for automatic OCR extraction.
          </p>

        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">

          <label className="flex flex-1 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 hover:bg-white/[0.04]">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Upload size={22} />
            </div>

            <div>

              <p className="font-medium">
                {file
                  ? file.name
                  : "Choose result card"}
              </p>

              <p className="mt-1 text-xs text-white/40">
                JPG or PNG • Maximum 10 MB
              </p>

            </div>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={
                handleFileChange
              }
            />

          </label>

          <button
            type="button"
            onClick={handleOCR}
            disabled={
              loading || !file
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-4 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Search size={18} />

            {loading
              ? "Extracting..."
              : "Extract Result"}

          </button>

        </div>

        {/* SELECTED FILE */}

        {file && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">

            <div>

              <p className="text-sm font-medium">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-white/40">
                {(file.size / 1024).toFixed(1)} KB
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setFile(null)
              }
              className="text-white/40 hover:text-red-400"
            >
              <Trash2 size={18} />
            </button>

          </div>
        )}

      </section>

      {/* =====================================================
          MATCHED MENTEE
      ===================================================== */}

      {matchedMentee && (
        <section className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-5">

          <div className="mb-4 flex items-center gap-2 text-emerald-400">

            <CheckCircle2 size={18} />

            <span className="text-sm font-semibold uppercase">
              Mentee matched successfully
            </span>

          </div>

          <div className="grid gap-4 md:grid-cols-4">

            <Info
              label="Name"
              value={
                matchedMentee.name
              }
            />

            <Info
              label="ERN"
              value={
                matchedMentee.ern
              }
            />

            <Info
              label="Roll Number"
              value={
                matchedMentee.rollNumber
              }
            />

            <Info
              label="Course"
              value={
                matchedMentee.course
              }
            />

          </div>

        </section>
      )}

      {/* =====================================================
          RESULT DETAILS
      ===================================================== */}

      {matchedMentee && (
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

          <div className="mb-5">

            <h2 className="text-lg font-semibold">
              Result Details
            </h2>

            <p className="mt-1 text-sm text-white/45">
              Review and correct the extracted information before saving.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-4">

            <Input
              label="Semester"
              type="number"
              value={
                form.semester
              }
              onChange={(e) =>
                updateForm(
                  "semester",
                  e.target.value
                )
              }
            />

            <Input
              label="SGPA"
              type="number"
              step="0.01"
              value={form.sgpa}
              onChange={(e) =>
                updateForm(
                  "sgpa",
                  e.target.value
                )
              }
            />

            <Input
              label="CGPA"
              type="number"
              step="0.01"
              value={form.cgpa}
              onChange={(e) =>
                updateForm(
                  "cgpa",
                  e.target.value
                )
              }
            />

            <Input
              label="Grand Total"
              type="number"
              value={
                form.grandTotal
              }
              onChange={(e) =>
                updateForm(
                  "grandTotal",
                  e.target.value
                )
              }
            />

            <Input
              label="Maximum Marks"
              type="number"
              value={
                form.maximumMarks
              }
              onChange={(e) =>
                updateForm(
                  "maximumMarks",
                  e.target.value
                )
              }
            />

            <Input
              label="Result"
              value={
                form.result
              }
              onChange={(e) =>
                updateForm(
                  "result",
                  e.target.value
                )
              }
            />

            <Input
              label="Overall Grade"
              value={
                form.overallGrade
              }
              onChange={(e) =>
                updateForm(
                  "overallGrade",
                  e.target.value
                )
              }
            />

            <Input
              label="Result Declared On"
              type="date"
              value={
                form.resultDeclaredOn
              }
              onChange={(e) =>
                updateForm(
                  "resultDeclaredOn",
                  e.target.value
                )
              }
            />

          </div>

          {/* REMARKS */}

          <div className="mt-5">

            <label className="mb-2 block text-sm text-white/60">
              Remarks
            </label>

            <textarea
              value={form.remarks}
              onChange={(e) =>
                updateForm(
                  "remarks",
                  e.target.value
                )
              }
              placeholder="Add remarks..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-blue-400/50"
            />

          </div>

        </section>
      )}

      {/* =====================================================
          SUBJECTS
      ===================================================== */}

      {matchedMentee && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>

              <h2 className="text-lg font-semibold">
                Subjects
              </h2>

              <p className="mt-1 text-sm text-white/45">
                Check and correct OCR values before saving.
              </p>

            </div>

            <button
              type="button"
              onClick={
                addSubject
              }
              className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/20"
            >

              <Plus size={17} />

              Add Subject

            </button>

          </div>

          <div className="space-y-5">

            {subjects.map(
              (subject, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >

                  <div className="mb-5 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-sm font-semibold text-blue-300">
                        {index + 1}
                      </div>

                      <span className="font-semibold">
                        Subject {index + 1}
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeSubject(
                          index
                        )
                      }
                      className="text-white/40 hover:text-red-400"
                      title="Remove subject"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                  <div className="grid gap-4 md:grid-cols-3">

                    <Input
                      label="Subject Name"
                      value={
                        subject.subjectName
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "subjectName",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Code"
                      value={
                        subject.code
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "code",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Grade"
                      value={
                        subject.grade
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "grade",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Internal Marks"
                      type="number"
                      value={
                        subject.internalMarks
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "internalMarks",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="SEE Marks"
                      type="number"
                      value={
                        subject.seeMarks
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "seeMarks",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Total Marks"
                      type="number"
                      value={
                        subject.totalMarks
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "totalMarks",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Grade Point"
                      type="number"
                      step="0.01"
                      value={
                        subject.gradePoint
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "gradePoint",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Credits"
                      type="number"
                      value={
                        subject.credits
                      }
                      onChange={(e) =>
                        updateSubject(
                          index,
                          "credits",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>
              )
            )}

          </div>

          {/* ===================================================
              SAVE
          =================================================== */}

          {subjects.length > 0 && (
            <div className="mt-6 flex justify-end">

              <button
                type="button"
                onClick={
                  handleConfirm
                }
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Save size={18} />

                {saving
                  ? "Saving..."
                  : "Confirm & Save Result"}

              </button>

            </div>
          )}

        </section>
      )}

    </div>
  );
};

// =========================================================
// INPUT COMPONENT
// =========================================================

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  step,
}) => {
  return (
    <div>

      <label className="mb-2 block text-sm text-white/60">
        {label}
      </label>

      <input
        type={type}
        step={step}
        value={value ?? ""}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-blue-400/50"
      />

    </div>
  );
};

// =========================================================
// INFO COMPONENT
// =========================================================

const Info = ({
  label,
  value,
}) => {
  return (
    <div>

      <p className="text-xs text-white/40">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium">
        {value || "-"}
      </p>

    </div>
  );
};

export default MentorAcademic;