const express = require("express");
const router = express.Router();

const auth = require("../middleWare/authentication");
const authorize = require("../middleWare/authorization");

const {
  createComplaint,
  getMyComplaints,
  getAssignedComplaints,
  respondToComplaint,
  getComplaintById,
  deleteComplaint,
  getAllComplaints

} = require("../controllers/complaintController");

// ADMIN routes
router.get("/", auth, authorize("ADMIN"), getAllComplaints);

// STUDENT routes
router.post("/", auth, authorize("STUDENT"), createComplaint);
router.get("/my", auth, authorize("STUDENT"), getMyComplaints);
router.delete("/:id", auth, authorize("STUDENT"), deleteComplaint);

// TPO/HOD routes
router.get("/assigned", auth, authorize("TPO", "HOD"), getAssignedComplaints);
router.put("/respond/:id", auth, authorize("TPO", "HOD"), respondToComplaint);

// Common routes (ID based)
router.get("/:id", auth, authorize("STUDENT", "TPO", "HOD"), getComplaintById);


module.exports = router;