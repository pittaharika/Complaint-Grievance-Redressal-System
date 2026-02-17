const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Resize 3072 → 1024
function resizeTo1024(vector) {
  const newVector = [];
  const chunkSize = vector.length / 1024; // 3072 / 1024 = 3

  for (let i = 0; i < 1024; i++) {
    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);

    const chunk = vector.slice(start, end);
    const avg =
      chunk.reduce((sum, val) => sum + val, 0) / chunk.length;

    newVector.push(avg);
  }

  return newVector;
}

const generateEmbedding = async (text) => {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001", // 3072 dimension
    contents: text,
  });

  const originalVector = response.embeddings[0].values;

  return resizeTo1024(originalVector); // Now 1024
};

module.exports = { generateEmbedding };
