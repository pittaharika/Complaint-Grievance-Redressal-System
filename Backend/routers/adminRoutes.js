const express = require("express");
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    createTPO,
    createHOD,
    getStaff,
    getDashboardStats
} = require("../controllers/adminController");
const auth = require("../middleWare/authentication");
const authorize = require("../middleWare/authorization");

// POST methods for actions
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/create-tpo", auth, authorize("ADMIN"), createTPO);
router.post("/create-hod", auth, authorize("ADMIN"), createHOD);

// GET methods
router.get("/staff", auth, authorize("ADMIN"), getStaff);
router.get("/dashboard-stats", auth, authorize("ADMIN"), getDashboardStats);

module.exports = router;
