import mongoose from "mongoose";

const concernSchema = new mongoose.Schema(
  {
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Academic",
        "Attendance",
        "Personal",
        "Career",
        "Financial",
        "Other",
      ],
      default: "Other",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Review", "Resolved"],
      default: "Pending",
    },

    mentorResponse: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Concern = mongoose.model(
  "Concern",
  concernSchema
);