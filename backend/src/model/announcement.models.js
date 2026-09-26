import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
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

    message: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["Normal", "Important", "Urgent"],
      default: "Normal",
    },

    publishDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.model(
  "Announcement",
  announcementSchema
);