const Complaint = require("../models/complaint");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!email.endsWith("@sasi.ac.in")) {
      return res.status(400).json({ message: "Only SASI mail allowed" });
    }

    if (!department) {
      return res.status(400).json({ message: "Department is required for students" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      department: department.toUpperCase(),
      role: "STUDENT"
    });

    res.status(201).json({
      message: "Student registered successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

    const student = await User.findOne({ email });
    if (!student) {
      console.log(`[LOGIN FAIL] User not found for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log(`[LOGIN FOUND] User found: ${student.email}, Role: ${student.role}`);

    // Allow STUDENT, TPO, and HOD to login via this route
    const allowedRoles = ["STUDENT", "TPO", "HOD"];
    if (!allowedRoles.includes(student.role)) {
      console.log(`[LOGIN FAIL] Role not allowed: ${student.role}`);
      return res.status(403).json({ message: "Access denied. Not a authorized account." });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      console.log(`[LOGIN FAIL] Password mismatch for user: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log(`[LOGIN SUCCESS] User logged in: ${email}`);

    const token = jwt.sign(
      { id: student._id, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
