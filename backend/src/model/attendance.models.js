import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { mentee: 1, date: 1 },
  { unique: true }
);

export const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);