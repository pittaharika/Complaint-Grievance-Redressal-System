const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // The SDK doesn't always expose listModels directly on genAI instance in some versions?
        // Actually standard way is usually via model manager or just try generating.
        // But let's check if we can list.
        // If not, we'll try to generate with 'gemini-pro' as a test.

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works: ", result.response.text());

        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        try {
            const resultFlash = await modelFlash.generateContent("Hello");
            console.log("gemini-1.5-flash works: ", resultFlash.response.text());
        } catch (e) {
            console.log("gemini-1.5-flash failed: " + e.message);
        }

        const model15 = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        try {
            const result15 = await model15.generateContent("Hello");
            console.log("gemini-1.5-pro works: ", result15.response.text());
        } catch (e) {
            console.log("gemini-1.5-pro failed: " + e.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
