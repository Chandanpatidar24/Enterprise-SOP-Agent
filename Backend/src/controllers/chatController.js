const DocumentChunk = require('../models/DocumentChunk');
const { generateEmbedding, getChatResponse } = require('../utils/aiService');

const askAI = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, message: 'Question is required' });
        }

        // 1. Generate embedding for the question
        const queryVector = await generateEmbedding(question);

        // 2. Retrieve top related chunks
        const contextChunks = await DocumentChunk.aggregate([
            {
                $vectorSearch: {
                    index: "default",
                    path: "vector",
                    queryVector: queryVector,
                    numCandidates: 100,
                    limit: 4
                }
            },
            {
                $project: {
                    text: 1,
                    sourceFile: 1,
                    pageNumber: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);

        if (contextChunks.length === 0) {
            return res.status(200).json({
                success: true,
                answer: "I'm sorry, I couldn't find any relevant information in the uploaded SOPs to answer your question.",
                sources: []
            });
        }

        // 3. Build Context String for LLM
        const contextText = contextChunks.map((chunk, index) =>
            `--- SOURCE ${index + 1} (File: ${chunk.sourceFile}, Page: ${chunk.pageNumber || 'N/A'}) ---\n${chunk.text}`
        ).join('\n\n');

        // 4. Construct Systemized Prompt
        const prompt = `
You are "OpsMind AI", a corporate knowledge assistant. Your goal is to answer employee questions strictly based on the provided context.

RULES:
1. ONLY use the context below to answer.
2. If the answer is NOT in the context, explicitly say: "I'm sorry, but that information is not covered in our current SOP documentation."
3. ALWAYS cite your sources. Format: "According to [Document Name] (Page [X])..." or similar.
4. Be professional and concise.

CONTEXT FROM SOPs:
${contextText}

QUESTION:
${question}

ANSWER:
`;

        // 5. Get AI Response
        const answer = await getChatResponse(prompt);

        // 6. Send Response with Sources (Deduplicated and Sorted)
        const uniqueSources = [];
        const sourceMap = new Set();

        contextChunks.forEach(chunk => {
            const identifier = `${chunk.sourceFile}-${chunk.pageNumber}`;
            if (!sourceMap.has(identifier)) {
                sourceMap.add(identifier);
                uniqueSources.push({
                    file: chunk.sourceFile,
                    page: chunk.pageNumber
                });
            }
        });

        // Optional: Sort by page number for readability
        uniqueSources.sort((a, b) => a.page - b.page);

        res.status(200).json({
            success: true,
            answer: answer,
            sources: uniqueSources
        });

    } catch (error) {
        console.error('Chat AI Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating AI response',
            error: error.message
        });
    }
};

module.exports = { askAI };
