const User = require("../models/user");
const Complaint = require("../models/complaint");
const RepeatedComplaint = require("../models/repeatedComplaint");
const bcrypt = require("bcryptjs");

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email.endsWith("@sasi.ac.in")) {
      return res.status(400).json({ message: "Only SASI mail allowed" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN"
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin
    });
  } catch (error) {
    console.error("registerAdmin error:", error);
    res.status(500).json({ message: "Server error", details: error.message, stack: error.stack });
  }
};

const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing. Ensure you are sending JSON." });
    }
    const { email, password } = req.body;

    const admin = await User.findOne({ email });
    if (!admin) {
      console.log("Login failed: User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Allow ADMIN, TPO and HOD
    const allowedRoles = ["ADMIN", "TPO", "HOD"];
    if (!allowedRoles.includes(admin.role)) {
      console.log("Login failed: Role not allowed for this route:", admin.role);
      return res.status(403).json({ message: "Access denied" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log("Login failed: Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("loginAdmin error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

const createTPO = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing. Ensure you are sending JSON." });
    }
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!email.endsWith("@sasi.ac.in")) {
      return res.status(400).json({ message: "Only SASI mail allowed" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tpo = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "TPO"
    });

    res.status(201).json({
      message: "TPO created successfully",
      tpo: {
        id: tpo._id,
        name: tpo.name,
        email: tpo.email,
        role: tpo.role
      }
    });

  } catch (error) {
    console.error("createTPO error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack
    });
  }
};

const createHOD = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing. Ensure you are sending JSON." });
    }
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "Name, email, password and department are required" });
    }

    if (!email.endsWith("@sasi.ac.in")) {
      return res.status(400).json({ message: "Only SASI mail allowed" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hod = await User.create({
      name,
      email,
      password: hashedPassword,
      department: department.toUpperCase(),
      role: "HOD"
    });

    res.status(201).json({
      message: "HOD created successfully",
      hod: {
        id: hod._id,
        name: hod.name,
        email: hod.email,
        role: hod.role
      }
    });

  } catch (error) {
    console.error("createHOD error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack
    });
  }
};


const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["HOD", "TPO"] } }).select("-password");
    res.json(staff);
  } catch (error) {
    console.error("getStaff error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // 1. Aggregation for Originals by Status
    // Result ex: [{ _id: "OPEN", count: 5 }, { _id: "RESOLVED", count: 2 }]
    const originalStats = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2. Aggregation for Duplicates (Mapped to Original Status)
    // We need to look up the status of the original complaint for each repeated complaint
    const duplicateStats = await RepeatedComplaint.aggregate([
      {
        $lookup: {
          from: "complaints",
          localField: "originalComplaintId",
          foreignField: "_id",
          as: "original"
        }
      },
      { $unwind: "$original" },
      {
        $group: {
          _id: "$original.status",
          count: { $sum: "$duplicateCount" }
        }
      }
    ]);

    // 3. Combine Stats
    const stats = {
      total: 0,
      resolved: 0,
      inProgress: 0,
      escalated: 0,
      open: 0
    };

    const processStats = (list) => {
      list.forEach(item => {
        const count = item.count || 0;
        stats.total += count;

        switch (item._id) {
          case "RESOLVED": stats.resolved += count; break;
          case "IN_PROGRESS": stats.inProgress += count; break;
          case "ESCALATED": stats.escalated += count; break;
          case "OPEN": stats.open += count; break;
          case "CLOSED": stats.resolved += count; break; // Treat closed as resolved for simple KPI? Or ignore?
          default: break;
        }
      });
    };

    processStats(originalStats);
    processStats(duplicateStats);

    // Also fetch recent complaints (originals only) for the list
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("studentId", "name")
      .populate("assignedTo", "name role");

    res.json({
      stats,
      recentComplaints
    });

  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

/* 🔴 EXPORT PROPERLY */
module.exports = {
  registerAdmin,
  loginAdmin,
  createTPO,
  createHOD,
  createHOD,
  getStaff,
  getDashboardStats
};
