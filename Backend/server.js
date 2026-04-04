const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const connectDB = require("./config/db");

// Routes
const adminRoutes = require("./routers/adminRoutes");
const userRoutes = require("./routers/studentRoutes");
const complaintRoutes = require("./routers/complaintRoutes");


connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON format found in request body" });
  }
  next(err);
});



// Routes
const auth = require("./middleWare/authentication");

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/complaints", complaintRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send(" College Grievance System API Running");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
