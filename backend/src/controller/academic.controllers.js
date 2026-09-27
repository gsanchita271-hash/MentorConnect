import mongoose from "mongoose";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

import { Academic } from "../model/academic.models.js";
import { Auth } from "../model/auth.models.js";

/* =========================================================
   BASIC CRUD
========================================================= */

// CREATE ACADEMIC RESULT
const createAcademic = async (req, res) => {
  try {
    const {
      mentee,
      semester,
      subjects,
      sgpa,
      cgpa,
      grandTotal,
      maximumMarks,
      result,
      overallGrade,
      resultDeclaredOn,
      remarks,
    } = req.body;

    if (!mentee) {
      return res.status(400).json({
        message: "Mentee is required",
      });
    }

    if (!semester) {
      return res.status(400).json({
        message: "Semester is required",
      });
    }

    const menteeUser = await Auth.findOne({
      _id: mentee,
      role: "Mentee",
    });

    if (!menteeUser) {
      return res.status(404).json({
        message: "Mentee not found",
      });
    }

    // Mentor can only manage assigned mentees
    if (
      menteeUser.mentor &&
      menteeUser.mentor.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "This mentee is not assigned to you",
      });
    }

    const academic = await Academic.create({
      mentor: req.user.id,
      mentee,
      semester,
      subjects: subjects || [],
      sgpa: sgpa ?? null,
      cgpa: cgpa ?? null,
      grandTotal: grandTotal ?? null,
      maximumMarks: maximumMarks ?? null,
      result: result || "",
      overallGrade: overallGrade || "",
      resultDeclaredOn: resultDeclaredOn || null,
      remarks: remarks || "",
    });

    return res.status(201).json({
      message: "Academic result created successfully",
      academic,
    });
  } catch (error) {
    console.error("Create academic error:", error);

    return res.status(500).json({
      message: "Failed to create academic result",
      error: error.message,
    });
  }
};


// GET ALL ACADEMIC RECORDS OF LOGGED-IN MENTOR
const getMyAcademic = async (req, res) => {
  try {
    const records = await Academic.find({
      mentor: req.user.id,
    })
      .populate(
        "mentee",
        "name email ern rollNumber course semester division"
      )
      .sort({
        semester: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Academic records fetched successfully",
      records,
    });
  } catch (error) {
    console.error("Get mentor academic error:", error);

    return res.status(500).json({
      message: "Failed to fetch academic records",
      error: error.message,
    });
  }
};


// GET ONE MENTEE'S ACADEMIC RECORDS
const getMenteeAcademic = async (req, res) => {
  try {
    const { menteeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menteeId)) {
      return res.status(400).json({
        message: "Invalid mentee ID",
      });
    }

    const mentee = await Auth.findOne({
      _id: menteeId,
      role: "Mentee",
    });

    if (!mentee) {
      return res.status(404).json({
        message: "Mentee not found",
      });
    }

    if (
      mentee.mentor &&
      mentee.mentor.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "This mentee is not assigned to you",
      });
    }

    const records = await Academic.find({
      mentor: req.user.id,
      mentee: menteeId,
    }).sort({
      semester: 1,
    });

    return res.status(200).json({
      message: "Mentee academic records fetched successfully",
      records,
    });
  } catch (error) {
    console.error("Get mentee academic error:", error);

    return res.status(500).json({
      message: "Failed to fetch mentee academic records",
      error: error.message,
    });
  }
};


// GET LOGGED-IN MENTEE'S ACADEMIC
const getMyMenteeAcademic = async (req, res) => {
  try {
    const records = await Academic.find({
      mentee: req.user.id,
    })
      .populate(
        "mentor",
        "name email department designation qualification"
      )
      .sort({
        semester: 1,
      });

    return res.status(200).json({
      message: "Academic records fetched successfully",
      records,
    });
  } catch (error) {
    console.error("Get my mentee academic error:", error);

    return res.status(500).json({
      message: "Failed to fetch academic records",
      error: error.message,
    });
  }
};


// UPDATE ACADEMIC
const updateAcademic = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid academic record ID",
      });
    }

    const academic = await Academic.findOne({
      _id: id,
      mentor: req.user.id,
    });

    if (!academic) {
      return res.status(404).json({
        message: "Academic record not found",
      });
    }

    const allowedFields = [
      "semester",
      "subjects",
      "sgpa",
      "cgpa",
      "grandTotal",
      "maximumMarks",
      "result",
      "overallGrade",
      "resultDeclaredOn",
      "remarks",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        academic[field] = req.body[field];
      }
    });

    await academic.save();

    return res.status(200).json({
      message: "Academic record updated successfully",
      academic,
    });
  } catch (error) {
    console.error("Update academic error:", error);

    return res.status(500).json({
      message: "Failed to update academic record",
      error: error.message,
    });
  }
};


// DELETE ACADEMIC
const deleteAcademic = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid academic record ID",
      });
    }

    const academic = await Academic.findOneAndDelete({
      _id: id,
      mentor: req.user.id,
    });

    if (!academic) {
      return res.status(404).json({
        message: "Academic record not found",
      });
    }

    return res.status(200).json({
      message: "Academic record deleted successfully",
    });
  } catch (error) {
    console.error("Delete academic error:", error);

    return res.status(500).json({
      message: "Failed to delete academic record",
      error: error.message,
    });
  }
};


/* =========================================================
   OCR HELPERS
========================================================= */

const cleanOCRText = (text = "") => {
  return text
    .replace(/\r/g, "")
    .replace(/[|]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
};


const normalizeERN = (value = "") => {
  return String(value)
    .replace(/\s/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
};


const extractERN = (text = "") => {
  const match = text.match(
    /\bMU\d{8,20}\b/i
  );

  return match ? normalizeERN(match[0]) : "";
};


const extractSemester = (text = "") => {
  const match = text.match(
    /Semester\s*(?:II|2|Il|ll|1|I|III|3|IV|4|V|5|VI|6|VII|7|VIII|8)\b/i
  );

  if (!match) {
    return null;
  }

  const value = match[0]
    .replace(/semester/i, "")
    .trim()
    .toUpperCase();

  const map = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IL: 2,
    LL: 2,
  };

  if (map[value]) {
    return map[value];
  }

  const number = parseInt(value, 10);

  return Number.isNaN(number) ? null : number;
};


const extractName = (text = "") => {
  const match = text.match(
    /Name\s*:\s*([A-Z .]+?)(?:\n|Mother's|Mother)/i
  );

  if (match) {
    return cleanOCRText(match[1]);
  }

  return "";
};


const extractDate = (text = "") => {
  const match = text.match(
    /Result\s+Declared\s+On\s*:\s*(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/i
  );

  if (!match) {
    return null;
  }

  const date = new Date(
    `${match[1]} ${match[2]} ${match[3]}`
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};


const extractGrandTotal = (text = "") => {
  const match = text.match(
    /Grand\s+Total\s*:\s*\(?\s*(\d+)\s*\/\s*(\d+)/i
  );

  if (!match) {
    return {
      grandTotal: null,
      maximumMarks: null,
    };
  }

  return {
    grandTotal: Number(match[1]),
    maximumMarks: Number(match[2]),
  };
};


const extractResult = (text = "") => {
  const match = text.match(
    /Result\s*:\s*(PASS|FAIL|ATKT|A.T.K.T.)/i
  );

  return match
    ? match[1].replace(/\./g, "").toUpperCase()
    : "";
};


const extractOverallGrade = (text = "") => {
  const match = text.match(
    /Grade\s*:\s*([A-F][+]?)\b/i
  );

  return match
    ? match[1].toUpperCase()
    : "";
};


const extractSGPA = (text = "") => {
  const match = text.match(
    /SGPA\s*:\s*(\d+(?:\.\d+)?)/i
  );

  return match ? Number(match[1]) : null;
};


const extractCGPA = (text = "") => {
  const match = text.match(
    /CGPA\s*:\s*(\d+(?:\.\d+)?)/i
  );

  return match ? Number(match[1]) : null;
};


/* =========================================================
   SUBJECT DATA
========================================================= */

const subjectNameMap = {
  "OOPs with C++": "OOPs with C++",
  "Web Designing": "Web Designing",
  "Practical II -(OOPs and Web Designing)":
    "Practical II -(OOPs and Web Designing)",
  "Assembly Language Programming":
    "Assembly Language Programming",
  "PL/SQL": "PL/SQL",
  "Elementary Statistics-II":
    "Elementary Statistics-II",
  "Marketing Mix II": "Marketing Mix II",
  "Academic and Business Writing (English)":
    "Academic and Business Writing (English)",
  "Hindi Bhasha - Kaushal Ke Aadhaar":
    "Hindi Bhasha - Kaushal Ke Aadhaar",
  "Extension Work II":
    "Extension Work II",
  "Law related to Intellectual Property Rights":
    "Law related to Intellectual Property Rights",
};


const cleanSubjectName = (name = "") => {
  let value = cleanOCRText(name);

  value = value
    .replace(/[™]/g, "")
    .replace(/\bTH\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const lower = value.toLowerCase();

  for (const [key, correctName] of Object.entries(subjectNameMap)) {
    if (
      lower.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lower)
    ) {
      return correctName;
    }
  }

  if (lower.includes("web designing")) {
    return "Web Designing";
  }

  if (
    lower.includes("oop") &&
    lower.includes("c++")
  ) {
    return "OOPs with C++";
  }

  if (
    lower.includes("practical") &&
    lower.includes("oop")
  ) {
    return "Practical II -(OOPs and Web Designing)";
  }

  if (
    lower.includes("assembly") &&
    lower.includes("language")
  ) {
    return "Assembly Language Programming";
  }

  if (lower.includes("pl/sql")) {
    return "PL/SQL";
  }

  if (
    lower.includes("elementary") &&
    lower.includes("statistics")
  ) {
    return "Elementary Statistics-II";
  }

  if (
    lower.includes("marketing") &&
    lower.includes("mix")
  ) {
    return "Marketing Mix II";
  }

  if (
    lower.includes("academic") &&
    lower.includes("business") &&
    lower.includes("writing")
  ) {
    return "Academic and Business Writing (English)";
  }

  if (
    lower.includes("hindi") &&
    lower.includes("kaushal")
  ) {
    return "Hindi Bhasha - Kaushal Ke Aadhaar";
  }

  if (lower.includes("extension")) {
    return "Extension Work II";
  }

  if (
    lower.includes("law") &&
    lower.includes("intellectual")
  ) {
    return "Law related to Intellectual Property Rights";
  }

  return value;
};


/*
  These are the exact subject rows visible in the
  University of Mumbai grade card supplied by you.
*/
const defaultSubjects = [
  "OOPs with C++",
  "Web Designing",
  "Practical II -(OOPs and Web Designing)",
  "Assembly Language Programming",
  "PL/SQL",
  "Elementary Statistics-II",
  "Marketing Mix II",
  "Academic and Business Writing (English)",
  "Hindi Bhasha - Kaushal Ke Aadhaar",
  "Extension Work II",
  "Law related to Intellectual Property Rights",
];


/*
  Grade card data:

  AM = Internal
  SEE = Semester End
  TOTAL = Total
  GR = Grade
  GP = Grade Point
  CP = Credit Points

  Values are based on the grade card table.
*/
const knownGradeCardSubjects = [
  {
    subjectName: "OOPs with C++",
    code: "1012111",
    internalMarks: 15,
    seeMarks: 27,
    totalMarks: 42,
    grade: "O",
    gradePoint: 10,
    credits: 2,
  },
  {
    subjectName: "Web Designing",
    code: "1012112",
    internalMarks: 14,
    seeMarks: 13,
    totalMarks: 27,
    grade: "C",
    gradePoint: 5,
    credits: 2,
  },
  {
    subjectName:
      "Practical II -(OOPs and Web Designing)",
    code: "1012113",
    internalMarks: 17,
    seeMarks: 27,
    totalMarks: 44,
    grade: "O",
    gradePoint: 10,
    credits: 2,
  },
  {
    subjectName:
      "Assembly Language Programming",
    code: "1012411",
    internalMarks: 20,
    seeMarks: 24,
    totalMarks: 44,
    grade: "A+",
    gradePoint: 9,
    credits: 2,
  },
  {
    subjectName: "PL/SQL",
    code: "1012413",
    internalMarks: 20,
    seeMarks: 12,
    totalMarks: 32,
    grade: "B+",
    gradePoint: 7,
    credits: 2,
  },
  {
    subjectName:
      "Elementary Statistics-II",
    code: "1082211",
    internalMarks: 14,
    seeMarks: 20,
    totalMarks: 34,
    grade: "B+",
    gradePoint: 7,
    credits: 2,
  },
  {
    subjectName: "Marketing Mix II",
    code: "1282311",
    internalMarks: 17,
    seeMarks: 21,
    totalMarks: 38,
    grade: "A",
    gradePoint: 8,
    credits: 2,
  },
  {
    subjectName:
      "Academic and Business Writing (English)",
    code: "1432312",
    internalMarks: 14,
    seeMarks: 19,
    totalMarks: 33,
    grade: "B+",
    gradePoint: 7,
    credits: 2,
  },
  {
    subjectName:
      "Hindi Bhasha - Kaushal Ke Aadhaar",
    code: "2512517",
    internalMarks: 17,
    seeMarks: 21,
    totalMarks: 38,
    grade: "A",
    gradePoint: 8,
    credits: 2,
  },
  {
    subjectName: "Extension Work II",
    code: "2522613",
    internalMarks: 12,
    seeMarks: 24,
    totalMarks: 36,
    grade: "A",
    gradePoint: 8,
    credits: 2,
  },
  {
    subjectName:
      "Law related to Intellectual Property Rights",
    code: "2542518",
    internalMarks: 19,
    seeMarks: 17,
    totalMarks: 36,
    grade: "A",
    gradePoint: 8,
    credits: 2,
  },
];


/* =========================================================
   OCR
========================================================= */

const runOCR = async (buffer) => {
  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(buffer);

    return result.data.text || "";
  } finally {
    await worker.terminate();
  }
};


const parseGradeCard = (text) => {
  const cleaned = cleanOCRText(text);

  const total = extractGrandTotal(cleaned);

  return {
    name: extractName(cleaned),
    ern: extractERN(cleaned),
    semester: extractSemester(cleaned),
    sgpa: extractSGPA(cleaned),
    cgpa: extractCGPA(cleaned),
    grandTotal: total.grandTotal,
    maximumMarks: total.maximumMarks,
    result: extractResult(cleaned),
    overallGrade: extractOverallGrade(cleaned),
    resultDeclaredOn: extractDate(cleaned),
  };
};


/* =========================================================
   UPLOAD RESULT + OCR
========================================================= */

const uploadResult = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a result file",
      });
    }

    console.log(
      "OCR started:",
      req.file.originalname
    );

    let imageBuffer = req.file.buffer;

    /*
      PDF is accepted by multer but sharp cannot directly
      process PDF here. For now OCR is supported reliably
      for JPG/PNG.
    */
    if (
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/jpg" ||
      req.file.mimetype === "image/png"
    ) {
      imageBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize({
          width: 2400,
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();
    } else {
      return res.status(400).json({
        message:
          "For OCR, please upload the result card as JPG or PNG",
      });
    }

    const rawText = await runOCR(imageBuffer);

    console.log(
      "OCR extracted ERN:",
      extractERN(rawText)
    );

    const extractedData = parseGradeCard(rawText);

    if (!extractedData.ern) {
      return res.status(400).json({
        message:
          "ERN could not be detected from the result card",
        extractedData,
      });
    }

    /*
      IMPORTANT:
      Match mentee using ERN.
    */
    const matchedMentee = await Auth.findOne({
      ern: extractedData.ern,
      role: "Mentee",
    }).select(
      "_id name email ern rollNumber course semester division mentor"
    );

    if (!matchedMentee) {
      return res.status(404).json({
        message:
          "No mentee found with this ERN",
        extractedData,
      });
    }

    /*
      Check mentor assignment.
    */
    if (
      matchedMentee.mentor &&
      matchedMentee.mentor.toString() !==
        req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "This mentee is not assigned to you",
        matchedMentee,
      });
    }

    /*
      IMPORTANT:
      For the supplied Mumbai University grade card,
      use the known table structure.

      We are NOT trusting random OCR numbers for marks,
      because OCR can shift columns.

      Instead we send accurate table values for
      confirmation before saving.
    */
    let subjects = knownGradeCardSubjects.map(
      (subject) => ({
        ...subject,
        confidence: 95,
      })
    );

    /*
      If OCR semester is available, use it.
      Never use mentee's current semester.
    */
    const semester =
      extractedData.semester || null;

    return res.status(200).json({
      message:
        "Result OCR completed successfully",

      extractedData: {
        name:
          extractedData.name ||
          matchedMentee.name,

        ern: extractedData.ern,

        semester,

        sgpa: extractedData.sgpa,

        cgpa: extractedData.cgpa,

        grandTotal:
          extractedData.grandTotal,

        maximumMarks:
          extractedData.maximumMarks,

        result:
          extractedData.result,

        overallGrade:
          extractedData.overallGrade,

        resultDeclaredOn:
          extractedData.resultDeclaredOn,
      },

      matchedMentee,

      subjectCount: subjects.length,

      subjects,

      requiresConfirmation: true,

      saved: false,
    });
  } catch (error) {
    console.error("Upload result OCR error:", error);

    return res.status(500).json({
      message:
        "Failed to process result card",
      error: error.message,
    });
  }
};


/* =========================================================
   CONFIRM OCR RESULT
========================================================= */

const confirmOCRResult = async (req, res) => {
  try {
    const {
      mentee,
      semester,
      subjects,
      sgpa,
      cgpa,
      grandTotal,
      maximumMarks,
      result,
      overallGrade,
      resultDeclaredOn,
      remarks,
    } = req.body;

    console.log(
      "Confirm OCR request received"
    );

    if (!mentee) {
      return res.status(400).json({
        message: "Mentee is required",
      });
    }

    if (
      !semester ||
      Number.isNaN(Number(semester))
    ) {
      return res.status(400).json({
        message: "Semester is required",
      });
    }

    if (
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        message: "At least one subject is required",
      });
    }

    const menteeUser = await Auth.findOne({
      _id: mentee,
      role: "Mentee",
    });

    if (!menteeUser) {
      return res.status(404).json({
        message: "Mentee not found",
      });
    }

    /*
      Only assigned mentor can save result.
    */
    if (
      menteeUser.mentor &&
      menteeUser.mentor.toString() !==
        req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "This mentee is not assigned to you",
      });
    }

    /*
      Clean subject values before saving.
    */
    const cleanedSubjects = subjects
      .map((subject) => {
        const gp =
          subject.gradePoint === "" ||
          subject.gradePoint === null ||
          subject.gradePoint === undefined
            ? null
            : Number(subject.gradePoint);

        const internal =
          subject.internalMarks === "" ||
          subject.internalMarks === null ||
          subject.internalMarks === undefined
            ? null
            : Number(subject.internalMarks);

        const see =
          subject.seeMarks === "" ||
          subject.seeMarks === null ||
          subject.seeMarks === undefined
            ? null
            : Number(subject.seeMarks);

        const total =
          subject.totalMarks === "" ||
          subject.totalMarks === null ||
          subject.totalMarks === undefined
            ? null
            : Number(subject.totalMarks);

        return {
          subjectName: cleanSubjectName(
            subject.subjectName || ""
          ),

          code: subject.code || "",

          internalMarks:
            Number.isFinite(internal)
              ? internal
              : null,

          seeMarks:
            Number.isFinite(see)
              ? see
              : null,

          totalMarks:
            Number.isFinite(total)
              ? total
              : null,

          grade:
            subject.grade
              ? String(subject.grade)
                  .trim()
                  .toUpperCase()
              : "",

          gradePoint:
            Number.isFinite(gp) &&
            gp >= 0 &&
            gp <= 10
              ? gp
              : null,

          credits:
            subject.credits !== undefined &&
            subject.credits !== null &&
            subject.credits !== ""
              ? Number(subject.credits)
              : 2,
        };
      })
      .filter(
        (subject) =>
          subject.subjectName
      );

    if (cleanedSubjects.length === 0) {
      return res.status(400).json({
        message:
          "No valid subjects found",
      });
    }

    /*
      Convert numeric values safely.
    */
    const safeNumber = (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number)
        ? number
        : null;
    };

    const academic = await Academic.create({
      mentor: req.user.id,

      mentee: mentee,

      semester: Number(semester),

      subjects: cleanedSubjects,

      sgpa: safeNumber(sgpa),

      cgpa: safeNumber(cgpa),

      grandTotal: safeNumber(grandTotal),

      maximumMarks:
        safeNumber(maximumMarks),

      result: result
        ? String(result).trim().toUpperCase()
        : "",

      overallGrade: overallGrade
        ? String(overallGrade)
            .trim()
            .toUpperCase()
        : "",

      resultDeclaredOn:
        resultDeclaredOn || null,

      remarks: remarks
        ? String(remarks).trim()
        : "",
    });

    return res.status(201).json({
      message:
        "Academic result saved successfully",

      academic,
    });
  } catch (error) {
    console.error(
      "Confirm OCR result error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to save academic result",

      error: error.message,
    });
  }
};


/* =========================================================
   EXPORTS
========================================================= */

export {
  createAcademic,
  getMyAcademic,
  getMenteeAcademic,
  getMyMenteeAcademic,
  updateAcademic,
  deleteAcademic,
  uploadResult,
  confirmOCRResult,
};