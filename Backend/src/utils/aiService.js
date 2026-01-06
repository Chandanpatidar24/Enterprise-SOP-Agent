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

const getChatResponse = async (prompt, modelId) => {
    try {
        // Handle opsMind 4.2 (Claude 3 Opus via OpenRouter)
        if (modelId === 'opsmind42') {
            if (!process.env.OPENROUTER_API_KEY_3opus) {
                console.warn("OPENROUTER_API_KEY_3opus missing, falling back to Gemini.");
            } else {
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY_3opus}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": "anthropic/claude-3-opus",
                            "messages": [
                                { "role": "user", "content": prompt }
                            ]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices && data.choices.length > 0) {
                            return data.choices[0].message.content;
                        }
                    } else {
                        console.error("OpenRouter API Error:", await response.text());
                    }
                } catch (orError) {
                    console.error("Error calling OpenRouter:", orError);
                    // Fallback to Gemini if OpenRouter fails
                }
            }
        }

        // Handle opsMind 5 (GPT-4 Turbo via OpenRouter)
        if (modelId === 'opsmind5') {
            if (!process.env.OPENROUTER_API_KEY_GPT4) {
                console.warn("OPENROUTER_API_KEY_GPT4 missing, falling back to Gemini.");
            } else {
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY_GPT4}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": "openai/gpt-4-turbo",
                            "messages": [
                                { "role": "user", "content": prompt }
                            ]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices && data.choices.length > 0) {
                            return data.choices[0].message.content;
                        }
                    } else {
                        console.error("OpenRouter GPT-4 API Error:", await response.text());
                    }
                } catch (orError) {
                    console.error("Error calling OpenRouter GPT-4:", orError);
                    // Fallback to Gemini if OpenRouter fails
                }
            }
        }

        // Default: Gemini (opsmind4 or fallback)
        const result = await chatModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error getting chat response:", error);
        throw error;
    }
};

const getChatResponseStream = async (prompt) => {
    try {
        const result = await chatModel.generateContentStream(prompt);
        return result.stream;
    } catch (error) {
        console.error("Error getting streaming response:", error);
        throw error;
    }
};

module.exports = { generateEmbedding, getChatResponse, getChatResponseStream };
