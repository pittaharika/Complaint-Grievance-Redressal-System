require("dotenv").config();
const { storeVector, checkDuplicateComplaint } = require("./service/aiservice");
const mongoose = require("mongoose");

async function testAI() {
    try {
        const testText = "This is a test complaint about lab equipment " + Date.now();
        const testId = new mongoose.Types.ObjectId();

        console.log("Testing storeVector...");
        const vectorId = await storeVector(testId, testText);

        if (vectorId) {
            console.log("SUCCESS: Vector stored with ID:", vectorId);

            console.log("Testing checkDuplicateComplaint with same text...");
            const result = await checkDuplicateComplaint(testText);
            console.log("Duplicate Check Result:", result);
        } else {
            console.error("FAILURE: storeVector returned null. Check logs above.");
        }
    } catch (error) {
        console.error("Test Error:", error);
    }
}

testAI();
