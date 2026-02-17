require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkConfiguredDimension(modelName, dim) {
    try {
        console.log(`Checking dimension for model: ${modelName} with outputDimensionality: ${dim}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent({
            content: { parts: [{ text: "This is a test." }] },
            outputDimensionality: dim
        });
        console.log(`Model: ${modelName}, Configured Dimension: ${result.embedding.values.length}`);
    } catch (error) {
        console.error(`Error with model ${modelName} at dim ${dim}:`, error.message);
    }
}

async function run() {
    await checkConfiguredDimension("text-embedding-004", 1024);
}

run();
