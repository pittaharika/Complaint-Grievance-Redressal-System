require("dotenv").config();
const mongoose = require("mongoose");
const Complaint = require("./models/complaint");
const { storeVector } = require("./service/aiservice");

async function syncComplaints() {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // 2. Find all complaints that are not duplicates and don't have a vectorId
        const complaints = await Complaint.find({
            duplicateOf: null,
            $or: [{ vectorId: { $exists: false } }, { vectorId: null }, { vectorId: "" }]
        });

        console.log(`Found ${complaints.length} complaints to sync.`);

        for (const complaint of complaints) {
            console.log(`Syncing complaint: ${complaint._id} - ${complaint.subject}`);

            const combinedText = `${complaint.subject} ${complaint.description}`;

            // 3. Store vector in Pinecone
            const vectorId = await storeVector(complaint._id, combinedText);

            if (vectorId) {
                complaint.vectorId = vectorId;
                await complaint.save();
                console.log(`Successfully synced: ${complaint._id}`);
            } else {
                console.error(`Failed to sync: ${complaint._id}`);
            }
        }

        console.log("Sync completed!");
        process.exit(0);
    } catch (error) {
        console.error("Sync error:", error);
        process.exit(1);
    }
}

syncComplaints();
