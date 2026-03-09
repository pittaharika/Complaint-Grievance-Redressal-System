const mongoose = require("mongoose");
const Complaint = require("./models/complaint");
const RepeatedComplaint = require("./models/repeatedComplaint");
const { checkDuplicateComplaint } = require("./service/aiservice");
const dotenv = require("dotenv");

dotenv.config();

const verifyAggregation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Setup Data
        const studentId = new mongoose.Types.ObjectId();

        // Clean up
        await Complaint.deleteMany({ subject: "TEST_AGGREGATION_SUBJECT" });
        await RepeatedComplaint.deleteMany({ subject: "TEST_AGGREGATION_SUBJECT" });

        // 2. Create ORIGINAL
        const original = await Complaint.create({
            studentId,
            category: "Hostel",
            subject: "TEST_AGGREGATION_SUBJECT",
            description: "The wifi in Block A is absolutely terrible and not working.",
            target: "HOD",
            status: "OPEN",
            duplicateCount: 0
        });
        console.log(`Original Created: ${original._id}`);

        // 3. Prepare "Existing Complaints" list for AI
        const existingComplaints = await Complaint.find({
            category: "Hostel",
            status: { $ne: "CLOSED" }
        });

        // 4. Test Duplicate 1
        const newSubject = "TEST_AGGREGATION_SUBJECT";
        const newDescription = "Wifi connection in Block A is down and very slow.";

        console.log("\n--- Processing Duplicate 1 ---");
        // We know AI works, so let's mock the result to focus on DB logic
        // This avoids 404/network issues during this specific test
        const aiResult = {
            isDuplicate: true,
            originalComplaintId: original._id,
            score: 100
        };

        const cleanId = aiResult.originalComplaintId.toString().trim();

        // Simulate Controller Logic for Duplicate 1 - TRYING TO FIX CONFLICT
        // The issue is likely that duplicateCount is in schema with default.
        // On upsert=true:
        // MongoDB creates doc. 
        // Applies $setOnInsert.
        // Applies $inc.
        // If 'duplicateCount' is NOT in $setOnInsert, but has a default in schema, Mongoose might be trying to set it via default, causing conflict with $inc.

        // FIX: Don't rely on mongoose default for duplicateCount during this op if possible?
        // OR: Use Find then Update/Create (2 steps) if atomic isn't strictly required for this scale.
        // Actually, let's try just standard findOneAndUpdate without setDefaultsOnInsert and see if we can make it work.
        // If still failing, we will do: Find -> if exists update, else create.

        let repeatedComplaint = await RepeatedComplaint.findOne({ originalComplaintId: cleanId });

        if (repeatedComplaint) {
            repeatedComplaint.duplicateCount += 1;
            await repeatedComplaint.save();
        } else {
            repeatedComplaint = await RepeatedComplaint.create({
                originalComplaintId: cleanId,
                studentId,
                category: "Hostel",
                subject: newSubject,
                description: newDescription,
                target: "HOD",
                similarityScore: aiResult.score,
                duplicateCount: 1
            });
        }

        console.log(`RepeatedComplaint 1: ID=${repeatedComplaint._id}, Count=${repeatedComplaint.duplicateCount}`);

        if (repeatedComplaint.duplicateCount !== 1) {
            console.log("⚠️  Count check failed");
        }

        // 5. Test Duplicate 2
        console.log("\n--- Processing Duplicate 2 ---");

        let repeatedComplaint2 = await RepeatedComplaint.findOne({ originalComplaintId: cleanId });

        if (repeatedComplaint2) {
            repeatedComplaint2.duplicateCount += 1;
            await repeatedComplaint2.save();
        } else {
            // Should not be reached
            console.log("❌ Error: Should have found existing record");
        }

        console.log(`RepeatedComplaint 2: ID=${repeatedComplaint2._id}, Count=${repeatedComplaint2.duplicateCount}`);

        // CHECK
        if (repeatedComplaint._id.toString() === repeatedComplaint2._id.toString()) {
            console.log("✅ SAME Document ID preserved");
        } else {
            console.log("❌ DIFFERENT Document IDs (Aggregation failed)");
        }

        if (repeatedComplaint2.duplicateCount === 2) {
            console.log("✅ Count incremented to 2");
        } else {
            console.log(`❌ Count is ${repeatedComplaint2.duplicateCount} (Expected 2)`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyAggregation();
