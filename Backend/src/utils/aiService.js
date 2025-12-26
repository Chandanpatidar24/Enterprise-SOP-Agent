const { GoogleGenerativeAI } = require("@google/generative-ai");

// Validate API Key
if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is missing in .env. Embeddings will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const generateEmbedding = async (text) => {
    try {
        const result = await embeddingModel.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

const getChatResponse = async (prompt) => {
    try {
        const result = await chatModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error getting chat response:", error);
        throw error;
    }
};

module.exports = { generateEmbedding, getChatResponse };
