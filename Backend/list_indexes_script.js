const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
pc.listIndexes().then(idx => {
    require('fs').writeFileSync('indexes.json', JSON.stringify(idx, null, 2), 'utf8');
}).catch(console.error);
