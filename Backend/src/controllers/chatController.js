const DocumentChunk = require('../models/DocumentChunk');
const ChatSession = require('../models/ChatSession');
const { generateEmbedding, getChatResponse } = require('../utils/aiService');

// Helper to generate a short title from the first question
const generateTitle = async (question) => {
    try {
        const prompt = `Generate a very short, concise title (max 5 words) for a chat that starts with this question: "${question}". Do not use quotes.`;
        const title = await getChatResponse(prompt);
        return title.trim() || 'New Chat';
    } catch (e) {
        return 'New Chat';
    }
};

const askAI = async (req, res) => {
    try {
        const { question, sessionId } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, message: 'Question is required' });
        }

        // 1. Identify or Create Session
        let session;
        if (sessionId) {
            session = await ChatSession.findById(sessionId);
            if (!session) {
                // If ID provided but not found, create new (or handle error, but creating new is safer for UX)
                session = new ChatSession({ messages: [] });
            }
        } else {
            session = new ChatSession({ messages: [] });
            // Generate title for new session
            session.title = await generateTitle(question);
        }

        // 2. Add User Message to Session
        session.messages.push({ role: 'user', text: question });

        // 3. RAG Pipeline: Generate embedding
        const queryVector = await generateEmbedding(question);

        // 4. Retrieve top related chunks
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

        let answer = "";
        let sources = [];

        if (contextChunks.length === 0) {
            answer = "I'm sorry, I couldn't find any relevant information in the uploaded SOPs to answer your question.";
        } else {
            // 5. Build Context
            const contextText = contextChunks.map((chunk, index) =>
                `--- SOURCE ${index + 1} (File: ${chunk.sourceFile}, Page: ${chunk.pageNumber || 'N/A'}) ---\n${chunk.text}`
            ).join('\n\n');

            // 6. Construct Prompt
            // We can optionally verify previous messages here for conversation context, 
            // but for now we'll stick to single-turn context + RAG to keep it efficient.
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
            answer = await getChatResponse(prompt);

            // 7. Process Sources
            const sourceMap = new Set();
            contextChunks.forEach(chunk => {
                const identifier = `${chunk.sourceFile}-${chunk.pageNumber}`;
                if (!sourceMap.has(identifier)) {
                    sourceMap.add(identifier);
                    sources.push({
                        file: chunk.sourceFile,
                        page: chunk.pageNumber
                    });
                }
            });
            sources.sort((a, b) => a.page - b.page);
        }

        // 8. Add AI Message to Session
        session.messages.push({
            role: 'ai',
            text: answer,
            sources: sources
        });
        session.lastUpdated = Date.now();
        await session.save();

        res.status(200).json({
            success: true,
            answer: answer,
            sources: sources,
            sessionId: session._id,
            title: session.title
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

// GET /api/chat/history
const getHistory = async (req, res) => {
    try {
        const sessions = await ChatSession.find()
            .select('title lastUpdated createdAt')
            .sort({ lastUpdated: -1 });

        res.status(200).json({ success: true, history: sessions });
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};

// GET /api/chat/history/:id
const getSession = async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, session });
    } catch (error) {
        console.error('Get Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch session' });
    }
};

// DELETE /api/chat/history/:id
const deleteSession = async (req, res) => {
    try {
        await ChatSession.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Session deleted' });
    } catch (error) {
        console.error('Delete Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete session' });
    }
};


module.exports = { askAI, getHistory, getSession, deleteSession };

