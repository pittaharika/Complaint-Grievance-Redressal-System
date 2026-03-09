const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    category: String,

    subject: { type: String, required: true },
    description: { type: String, required: true },

    target: {
      type: String,
      enum: ["HOD", "TPO"],
      required: true
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"],
      default: "OPEN"
    },

    response: String,

    // 🔽 ADD THESE FIELDS (FOR DUPLICATES)

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null
    },

    duplicateCount: {
      type: Number,
      default: 0
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
  default: "MEDIUM"
},
duplicateUsers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],


    duplicates: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
