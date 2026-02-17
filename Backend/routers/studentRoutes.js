const express = require("express");
const router = express.Router();

const auth = require("../middleWare/authentication");
const authorize = require("../middleWare/authorization");
const studentController = require("../controllers/studentController");

// Auth Routes
router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);

module.exports = router;
