const mongoose = require("mongoose");

const repeatedComplaintSchema = new mongoose.Schema({
    originalComplaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint"
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: String,
    subject: String,
    description: String,
    target: {
        type: String,
        enum: ["HOD", "TPO"]
    },
    department: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    similarityScore: Number,
    duplicateCount: {
        type: Number,
        default: 1
    },
    status: {
  type: String,
  enum: ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"],
  default: "OPEN"
}


}, { timestamps: true });

module.exports = mongoose.model("RepeatedComplaint", repeatedComplaintSchema);
