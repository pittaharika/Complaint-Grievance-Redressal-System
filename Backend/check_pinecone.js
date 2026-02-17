require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function checkPinecone() {
    try {
        console.log("Initializing Pinecone with API key...");
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });

        console.log("Listing indexes...");
        const indexes = await pc.listIndexes();
        console.log("Indexes found:", JSON.stringify(indexes, null, 2));

        const indexName = process.env.PINECONE_INDEX;
        const indexExists = indexes.indexes.some(idx => idx.name === indexName);

        if (indexExists) {
            console.log(`SUCCESS: Index "${indexName}" exists.`);
            const index = pc.index(indexName);
            console.log("Describing index stats...");
            const stats = await index.describeIndexStats();
            console.log("Index stats:", JSON.stringify(stats, null, 2));
        } else {
            console.error(`FAILURE: Index "${indexName}" does NOT exist in the list.`);
        }

    } catch (error) {
        console.error("Pinecone Connection Error:", error);
    }
}

checkPinecone();
