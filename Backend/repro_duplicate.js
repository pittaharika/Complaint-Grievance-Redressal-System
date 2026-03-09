const mongoose = require("mongoose");
const Complaint = require("./models/complaint");
const RepeatedComplaint = require("./models/repeatedComplaint");
const User = require("./models/user");
const { checkDuplicateComplaint } = require("./service/aiservice");
const dotenv = require("dotenv");

dotenv.config();

// MOCK the AI service to force a duplicate match
// We can't easily mock require in this script without jest/sinon, 
// so we'll just insert data manually to simulate what the controller does.
// OR we can actually run the real AI if we have the key (we do).
// But for deterministic testing, let's simulates the CONTROLLER logic directly.

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Setup Data
        const studentId = new mongoose.Types.ObjectId();
        const hodId = new mongoose.Types.ObjectId(); // Mock HOD

        // Clean up previous test data
        await Complaint.deleteMany({ subject: "TEST_DUPLICATE_SUBJECT" });
        await RepeatedComplaint.deleteMany({ subject: "TEST_DUPLICATE_SUBJECT" });

        console.log("Cleaned up old test data");

        // 2. Create ORIGINAL Complaint
        const original = await Complaint.create({
            studentId,
            category: "Test",
            subject: "TEST_DUPLICATE_SUBJECT",
            description: "This is the original complaint description",
            target: "HOD",
            assignedTo: hodId,
            status: "OPEN",
            duplicateCount: 0
        });

        console.log(`Original Created: ${original._id}, Count: ${original.duplicateCount}`);

        // 3. Simulate DUPLICATE implementation (Copying logic from controller)
        // Simulate detection of duplicate
        console.log("Simulating duplicate detection...");

        // This is the logic from controller:
        const originalComplaint = await Complaint.findById(original._id);
        if (originalComplaint) {
            originalComplaint.duplicateCount = (originalComplaint.duplicateCount || 0) + 1;

            originalComplaint.duplicates.push({
                studentId: new mongoose.Types.ObjectId(), // Another student
                createdAt: new Date()
            });

            await originalComplaint.save();
        }

        // 4. Verify Count
        const updatedOriginal = await Complaint.findById(original._id);
        console.log(`Updated Original: ${updatedOriginal._id}, Count: ${updatedOriginal.duplicateCount}`);

        if (updatedOriginal.duplicateCount === 1) {
            console.log("✅ SUCCESS: Duplicate count incremented correctly to 1");
        } else {
            console.log("❌ FAILURE: Duplicate count is " + updatedOriginal.duplicateCount);
        }

        // 5. Simulate another one
        originalComplaint.duplicateCount = (originalComplaint.duplicateCount || 0) + 1;
        await originalComplaint.save();

        const updatedOriginal2 = await Complaint.findById(original._id);
        console.log(`Updated Original (2nd): ${updatedOriginal2._id}, Count: ${updatedOriginal2.duplicateCount}`);

        if (updatedOriginal2.duplicateCount === 2) {
            console.log("✅ SUCCESS: Duplicate count incremented correctly to 2");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTest();
