require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testV4() {
    try {
        console.log("Testing models/text-embedding-004...");
        const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
        const result = await model.embedContent({
            content: { parts: [{ text: "This is a test." }] },
            outputDimensionality: 1024
        });
        console.log("SUCCESS: Dimension:", result.embedding.values.length);
    } catch (error) {
        console.error("FAILURE:", error.message);
    }
}

testV4();
