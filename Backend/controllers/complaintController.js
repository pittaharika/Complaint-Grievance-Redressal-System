const Complaint = require("../models/complaint");
const User = require("../models/user");
const RepeatedComplaint = require("../models/repeatedComplaint");
const { sendEmail } = require("../service/emailService");
const { generateEmbedding } = require("../utils/embedding");
const { index } = require("../utils/pinecone");



const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.8;

// ==============================================
// SIMPLE FREE EMBEDDING FUNCTION (NO OPENAI)
// ==============================================
function simpleEmbedding(text) {
  const words = text.toLowerCase().split(" ");
  const vector = new Array(1024).fill(0);

  words.forEach(word => {
    const index = word.length % 1024;
    vector[index] += 1;
  });

  return vector;
}


// ============================================================
// CREATE COMPLAINT
// ============================================================
exports.createComplaint = async (req, res) => {
  try {
    const { category, subject, description, message, target, department } = req.body;
    const studentId = req.user.id;
    const finalDescription = description || message;

    if (!subject || !finalDescription) {
      return res.status(400).json({
        message: "Subject and description are required"
      });
    }

    if (target === "HOD" && !department) {
      return res.status(400).json({
        message: "Department is required for HOD complaints"
      });
    }

    // ============================================================
    // AUTO ASSIGN HOD / TPO
    // ============================================================
    let assignedTo;

    if (target === "HOD") {
      assignedTo = await User.findOne({
        role: "HOD",
        department: department.toUpperCase()
      });
    } else if (target === "TPO") {
      assignedTo = await User.findOne({ role: "TPO" });
    }

    if (!assignedTo) {
      return res.status(404).json({
        message: `${target} not found`
      });
    }

    // ============================================================
    // PINECONE SETUP (v3)
    // ============================================================
   

    const text = subject + " " + finalDescription;
const vector = await generateEmbedding(text);


    // ============================================================
    // 🔥 DUPLICATE CHECK
    // ============================================================
    const searchResponse = await index.query({
      vector: vector,
      topK: 3,
      includeMetadata: true
    });

    if (
      searchResponse.matches &&
      searchResponse.matches.length > 0 &&
      searchResponse.matches[0].score > SIMILARITY_THRESHOLD
    ) {
      const originalComplaintId =
  searchResponse.matches[0].metadata.complaintId;


      let repeatedComplaint = await RepeatedComplaint.findOne({
        originalComplaintId
      });

      if (repeatedComplaint) {
        repeatedComplaint.duplicateCount += 1;
        await repeatedComplaint.save();
      } else {
        repeatedComplaint = await RepeatedComplaint.create({
          originalComplaintId,
          studentId,
          category,
          subject,
          description: finalDescription,
          target,
          department: target === "HOD" ? department : null,
          assignedTo: assignedTo._id,
          similarityScore: searchResponse.matches[0].score,
          duplicateCount: 1
        });
      }

      const originalComplaint = await Complaint.findById(originalComplaintId);

      if (originalComplaint) {
        originalComplaint.duplicateCount =
          (originalComplaint.duplicateCount || 0) + 1;

        if (originalComplaint.duplicateCount >= 3) {
          originalComplaint.status = "ESCALATED";
          originalComplaint.priority = "HIGH";
        }

        await originalComplaint.save();

// 🔥 SEND EMAIL ONLY IF DIFFERENT USER
if (studentId.toString() !== originalComplaint.studentId.toString()) {

  const duplicateUser = await User.findById(studentId);

  if (duplicateUser?.email) {
    await sendEmail(
      duplicateUser.email,
      "Complaint Linked to Existing Issue",
      `Hello ${duplicateUser.name},

Your complaint matches an existing complaint.

It has been linked to Complaint ID: ${originalComplaintId}

Thank you,
College Complaint System`
    );
  }
}


}
      return res.status(201).json({
        message: "Duplicate complaint detected",
        repeatedComplaint,
        similarityScore: searchResponse.matches[0].score
      });
    }

    // ============================================================
    // CREATE NEW COMPLAINT
    // ============================================================
    const complaint = await Complaint.create({
      studentId,
      category,
      subject,
      description: finalDescription,
      target,
      department: target === "HOD" ? department : null,
      assignedTo: assignedTo._id,
      status: "IN_PROGRESS",
      duplicateCount: 0
    });

    // ============================================================
    // STORE VECTOR IN PINECONE (v3 FORMAT)
    // ============================================================
    await index.upsert([
  {
    id: complaint._id.toString(),
    values: vector,
    metadata: {
      complaintId: complaint._id.toString(),
      subject,
      description: finalDescription,
      studentId
    }
  }
]);

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint
    });

  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// GET MY COMPLAINTS
// ============================================================
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.user.id })
      .populate("assignedTo", "name role department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// GET ALL COMPLAINTS
// ============================================================
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("studentId", "name email")
      .populate("assignedTo", "name role department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================================================
// GET SINGLE COMPLAINT BY ID
// ============================================================
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("assignedTo", "name role department");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================================================
// GET ASSIGNED COMPLAINTS
// ============================================================
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.id })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// RESPOND TO COMPLAINT
// ============================================================
exports.respondToComplaint = async (req, res) => {
  try {
    const { response, status } = req.body;

// Convert status safely to uppercase
const finalStatus = status ? status.toUpperCase() : "RESOLVED";


    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { response, status: finalStatus },
      { new: true }
    )
      .populate("studentId", "name email")
      .populate("assignedTo", "name role department");
      // ==========================================
// 🔥 UPDATE ALL DUPLICATES STATUS
// ==========================================

if (finalStatus === "RESOLVED") {
  await RepeatedComplaint.updateMany(
    { originalComplaintId: complaint._id },
    { status: "RESOLVED" }
  );
}


    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    ///////////////////////////////

    // ==========================================
// 🔥 NOTIFY DUPLICATE USERS
// ==========================================

// Find all repeated complaints linked to this original complaint
const repeatedComplaints = await RepeatedComplaint.find({
  originalComplaintId: complaint._id
}).populate("studentId", "name email");

// Send email to each duplicate user
await Promise.all(
  repeatedComplaints.map(async (dup) => {
    if (dup.studentId?.email) {
      await sendEmail(
        dup.studentId.email,
        "Complaint You Reported Has Been Resolved",
        `Hello ${dup.studentId.name},

The complaint you reported was linked to an existing issue.

That issue has now been resolved.

Subject: ${complaint.subject}

Response:
${complaint.response}

Status: ${complaint.status}

Thank you,
College Complaint System`
      );
    }
  })
);

    // Populate duplicate users also
await complaint.populate("duplicateUsers", "name email");

// Collect all users (original + duplicates)
const usersToNotify = [
  complaint.studentId,
  ...complaint.duplicateUsers
];

// Remove duplicates safely
const uniqueUsers = [
  ...new Map(usersToNotify.map(user => [user._id.toString(), user])).values()
];

// Send email to everyone
await Promise.all(
  uniqueUsers
    .filter(user => user?.email)
    .map(user =>
      sendEmail(
        user.email,
        "Your Complaint Has Been Resolved",
        `Hello ${user.name},

Your complaint "${complaint.subject}" has been responded to.

Response:
${response}

Status: ${complaint.status}

Thank you,
College Complaint System`
      )
    )
);




    res.json({
      message: "Response added successfully and email sent",
      complaint
    });

  } catch (error) {
    console.error("Respond complaint error:", error);
    res.status(500).json({ message: error.message });
  }
};



// ============================================================
// CLOSE COMPLAINT
// ============================================================
exports.closeComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "CLOSED" },
      { new: true }
    );

    res.json({ message: "Complaint closed", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// DELETE COMPLAINT
// ============================================================
exports.deleteComplaint = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
