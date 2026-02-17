const mongoose = require("mongoose");
const dotenv = require("dotenv");
const complaintController = require("./controllers/complaintController");
const User = require("./models/user");
const Complaint = require("./models/complaint");
const RepeatedComplaint = require("./models/repeatedComplaint"); // Ensure model is loaded

dotenv.config();

const reproduceCrash = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Get a Student ID (Mock or Real)
        let student = await User.findOne({ role: "STUDENT" });
        if (!student) {
            console.log("Creating mock student...");
            student = await User.create({
                name: "Test Student",
                email: "test_student@sasi.ac.in",
                password: "hashedpassword",
                role: "STUDENT",
                department: "MECH" // Needs to match mock data
            });
        }
        console.log(`Using Student ID: ${student._id}`);

        // 1b. Ensure HOD exists
        let hod = await User.findOne({ role: "HOD", department: "MECH" });
        if (!hod) {
            console.log("Creating mock HOD...");
            hod = await User.create({
                name: "Test HOD",
                email: "test_hod@sasi.ac.in",
                password: "hashedpassword",
                role: "HOD",
                department: "MECH"
            });
        }

        // 2. Mock Request and Response
        const req = {
            user: { id: student._id },
            body: {
                category: "Hostel",
                subject: "TEST_AGGREGATION_SUBJECT", // reuse subject from verify script
                description: "The wifi in Block A is absolutely terrible and not working.",
                target: "HOD",
                department: "MECH"
            }
        };

        const res = {
            status: function (code) {
                console.log(`[Response Status]: ${code}`);
                return this;
            },
            json: function (data) {
                console.log(`[Response JSON]:`, JSON.stringify(data, null, 2));
                return this;
            }
        };

        // 3. Ensure "Original" exists to trigger Duplicate Logic
        let existing = await Complaint.findOne({ subject: "TEST_AGGREGATION_SUBJECT" });
        if (!existing) {
            console.log("Creating original complaint for test...");
            existing = await Complaint.create({
                studentId: student._id,
                category: "Hostel",
                subject: "TEST_AGGREGATION_SUBJECT",
                description: "Original description",
                target: "HOD",
                department: "MECH",
                status: "OPEN",
                duplicateCount: 0
            });
        }
        console.log(`Original exists: ${existing._id}`);

        // 4. Call Controller
        console.log("--- Calling createComplaint ---");
        await complaintController.createComplaint(req, res);
        console.log("--- Controller call finished ---");

        process.exit(0);

    } catch (err) {
        console.error("FATAL ERROR CAUGHT IN SCRIPT:", err);
        process.exit(1);
    }
};

reproduceCrash();
