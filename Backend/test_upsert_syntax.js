require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { v4: uuidv4 } = require("uuid");

async function testUpsert() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);

    const dummyVector = new Array(1024).fill(0.1); // Match 1024 dimension
    const id = uuidv4();

    try {
        console.log("Testing upsert with array...");
        await index.upsert([{ id, values: dummyVector, metadata: { test: true } }]);
        console.log("SUCCESS with array");
    } catch (err1) {
        console.log("FAILED with array:", err1.message);
        try {
            console.log("Testing upsert with { vectors: [...] }...");
            await index.upsert({ vectors: [{ id, values: dummyVector, metadata: { test: true } }] });
            console.log("SUCCESS with { vectors: [...] }");
        } catch (err2) {
            console.log("FAILED with { vectors: [...] }:", err2.message);
        }
    }
}

testUpsert();
