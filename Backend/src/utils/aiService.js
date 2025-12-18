const { GoogleGenerativeAI } = require("@google/generative-ai");

// Validate API Key
if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is missing in .env. Embeddings will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

const generateEmbedding = async (text) => {
    try {
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

module.exports = { generateEmbedding };
