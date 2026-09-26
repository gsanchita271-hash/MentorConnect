import mongoose from "mongoose";

const academicSchema = new mongoose.Schema(
  {
    // Mentor who uploaded/created the result
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    // Student whose result this belongs to
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    // Semester
    semester: {
      type: Number,
      required: true,
      min: 1,
    },

    // Subject-wise result
    subjects: [
      {
        subjectName: {
          type: String,
          required: true,
          trim: true,
        },

        // University subject/course code
        code: {
          type: String,
          trim: true,
          default: "",
        },

        // Internal / CIA marks
        internalMarks: {
          type: Number,
          min: 0,
          default: null,
        },

        // Semester End Examination marks
        seeMarks: {
          type: Number,
          min: 0,
          default: null,
        },

        // Total obtained marks
        totalMarks: {
          type: Number,
          min: 0,
          default: null,
        },

        // Grade: A+, A, B+, etc.
        grade: {
          type: String,
          trim: true,
          default: "",
        },

        // Grade point
        gradePoint: {
          type: Number,
          min: 0,
          max: 10,
          default: null,
        },

        // Credits
        credits: {
          type: Number,
          min: 0,
          default: null,
        },
      },
    ],

    // Semester Grade Point Average
    sgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    // Cumulative Grade Point Average
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    // Grand total obtained
    grandTotal: {
      type: Number,
      min: 0,
      default: null,
    },

    // Maximum possible marks
    maximumMarks: {
      type: Number,
      min: 0,
      default: null,
    },

    // PASS / FAIL
    result: {
      type: String,
      trim: true,
      default: "",
    },

    // Overall grade
    overallGrade: {
      type: String,
      trim: true,
      default: "",
    },

    // Result declared date
    resultDeclaredOn: {
      type: Date,
      default: null,
    },

    // Optional remarks
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Academic = mongoose.model("Academic", academicSchema);