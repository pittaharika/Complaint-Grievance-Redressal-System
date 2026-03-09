const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  role: {
    type: String,
    enum: ["ADMIN", "STUDENT", "HOD", "TPO"],
    required: true
  },
  department: {
    type: String,
    default: null,
    required: function () {
      return this.role === 'HOD' || this.role === 'STUDENT';
    }
  },
    // 🔐 Forgot Password Fields
  resetPasswordToken: {
    type: String,
    role: ["ADMIN", "STUDENT", "HOD", "TPO"]
  },
  resetPasswordExpires: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
