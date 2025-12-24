const DocumentChunk = require('../models/DocumentChunk');
const { generateEmbedding } = require('../utils/aiService');

const searchChunks = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        // 1. Generate embedding for the user's query
        console.log(`Searching for: "${query}"`);
        const queryVector = await generateEmbedding(query);

        // 2. Perform Vector Search in MongoDB
        // Note: index name defaults to 'default'. Ensure this matches your Atlas setup.
        const results = await DocumentChunk.aggregate([
            {
                $vectorSearch: {
                    index: "default",
                    path: "vector",
                    queryVector: queryVector,
                    numCandidates: 100, // Number of initial candidates to consider
                    limit: 5 // Top matches to return
                }
            },
            {
                $project: {
                    score: { $meta: "vectorSearchScore" },
                    text: 1,
                    sourceFile: 1,
                    pageNumber: 1,
                    chunkIndex: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            totalResults: results.length,
            results: results
        });

    } catch (error) {
        console.error('Vector Search Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing vector search',
            error: error.message
        });
    }
};

module.exports = { searchChunks };
