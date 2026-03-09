require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkDimension(modelName) {
    try {
        console.log(`Checking dimension for model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent("This is a test.");
        console.log(`Model: ${modelName}, Dimension: ${result.embedding.values.length}`);
    } catch (error) {
        console.error(`Error with model ${modelName}:`, error.message);
    }
}

async function run() {
    await checkDimension("gemini-embedding-001");
    await checkDimension("text-embedding-004");
}

run();
