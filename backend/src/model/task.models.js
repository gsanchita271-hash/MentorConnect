import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
      },
    ],

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    goal: {
      type: String,
      trim: true,
      default: "",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    startDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model("Task", taskSchema);