const mongoose = require("mongoose");
const Complaint = require("./models/complaint");
const RepeatedComplaint = require("./models/repeatedComplaint");
const { checkDuplicateComplaint } = require("./service/aiservice");
const dotenv = require("dotenv");

dotenv.config();

const verifyFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Setup Data
        const studentId = new mongoose.Types.ObjectId();

        // Clean up
        await Complaint.deleteMany({ subject: "TEST_AI_FLOW_SUBJECT" });
        await RepeatedComplaint.deleteMany({ subject: "TEST_AI_FLOW_SUBJECT" });

        // 2. Create ORIGINAL
        const original = await Complaint.create({
            studentId,
            category: "Hostel",
            subject: "TEST_AI_FLOW_SUBJECT",
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

        // 4. Test AI with SIMILAR complaint
        const newSubject = "TEST_AI_FLOW_SUBJECT"; // Same subject for easy match
        const newDescription = "Wifi connection in Block A is down and very slow.";

        console.log("Calling AI Service...");
        const aiResult = await checkDuplicateComplaint(
            newSubject,
            newDescription,
            existingComplaints
        );

        console.log("AI Result:", JSON.stringify(aiResult, null, 2));

        // 5. Verify ID Match
        if (aiResult.isDuplicate) {
            console.log("✅ AI Detected Duplicate");

            const returnedId = aiResult.originalComplaintId;
            const originalIdStr = original._id.toString();

            console.log(`Returned ID: '${returnedId}'`);
            console.log(`Original ID: '${originalIdStr}'`);

            if (returnedId && returnedId.toString().trim() === originalIdStr) {
                console.log("✅ IDs Match perfectly");
            } else {
                console.log("❌ IDs DO NOT MATCH or format is wrong");
            }

            // 6. Simulate Controller Update
            if (returnedId) {
                const cleanId = returnedId.trim();
                const foundOriginal = await Complaint.findById(cleanId);
                if (foundOriginal) {
                    foundOriginal.duplicateCount += 1;
                    await foundOriginal.save();
                    console.log(`✅ Database Updated. New Count: ${foundOriginal.duplicateCount}`);
                } else {
                    console.log(`❌ Could not find original in DB with ID: ${cleanId}`);
                }
            }

        } else {
            console.log("❌ AI FAILED to detect duplicate (Score too low?)");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyFlow();
