import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    // Common fields
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["Admin", "Mentor", "Mentee"],
      required: true,
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    // Mentor fields
    department: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    experience: {
      type: String,
      trim: true,
    },

    employeeId: {
      type: String,
      trim: true,
    },

    // Mentee fields
    course: {
      type: String,
      trim: true,
    },

    semester: {
      type: Number,
      min: 1,
    },

    rollNumber: {
      type: String,
      trim: true,
    },

    // University Enrollment/Registration Number
    ern: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    division: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Auth = mongoose.model("Auth", authSchema);