require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.checkDuplicateComplaint = async (subject, description, complaints) => {
    if (!complaints || complaints.length === 0) {
        return { isDuplicate: false };
    }

    // ⚡ Fast Check: Exact Subject Match (ignoring case/whitespace)
    const exactMatch = complaints.find(c => c.subject.toLowerCase().trim() === subject.toLowerCase().trim());
    if (exactMatch) {
        console.log(`[DEBUG] Exact subject match found: ${exactMatch._id}`);
        return {
            isDuplicate: true,
            originalComplaintId: exactMatch._id,
            score: 100
        };
    }

    try {
        // Switch to 'gemini-pro' as 'gemini-1.5-flash' was not found
        const model = genAI.getGenerativeModel({
            model: "gemini-pro"
        });

        const prompt = `
You are a complaint similarity analyzer for a college grievance system.
Your task is to determine if a "New Complaint" is semantically similar to any from a list of "Existing Complaints".

New Complaint:
Subject: ${subject}
Description: ${description}

Existing Complaints:
${complaints.map(c => `
ID: ${c._id}
Subject: ${c.subject}
Description: ${c.description}
`).join("\n")}

Rules:
1. Compare the New Complaint with each Existing Complaint.
2. Calculate a similarityScore (0-100) based on intent and content.
3. If ANY existing complaint has a similarityScore >= 70, set isDuplicate to true and provide its ID in originalComplaintId.
4. If no duplicates are found, set isDuplicate to false and originalComplaintId to null.
5. Return ONLY a valid JSON object.

Response Format:
{
  "isDuplicate": boolean,
  "originalComplaintId": "string_of_id",
  "similarityScore": number
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`[DEBUG] AI Raw Response:`, text);

        // Safe JSON extraction
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) {
            throw new Error("No JSON found in AI response");
        }

        const json = JSON.parse(match[0]);

        // Force boolean and number types
        return {
            isDuplicate: !!(json.isDuplicate === true || json.isDuplicate === "true" || (json.similarityScore && json.similarityScore >= 70)),
            originalComplaintId: json.originalComplaintId || null,
            score: json.similarityScore || json.score || 0
        };

    } catch (error) {
        console.error("Gemini AI Error:", error.message, "Response text:", error.response?.text ? await error.response.text() : "No extra detail");

        // Fail-safe → allow complaint if AI fails
        return { isDuplicate: false, score: 0, originalComplaintId: null };
    }
};