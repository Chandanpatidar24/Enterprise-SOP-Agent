const { parsePDF, chunkText } = require('../utils/textProcessor');
const { generateEmbedding } = require('../utils/aiService');
const DocumentChunk = require('../models/DocumentChunk');
const fs = require('fs');

const uploadPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please Upload a PDF File' });
        }

        const filePath = req.file.path;
        console.log(`Processing file: ${req.file.originalname}`);

        // 1. Parse PDF
        const { text } = await parsePDF(filePath);
        if (!text) {
            return res.status(400).json({ success: false, message: 'Could not extract text from PDF' });
        }

        // 2. Chunk Text
        const chunks = chunkText(text);
        console.log(`Generated ${chunks.length} chunks.`);

        // 3. Generate Embeddings & Save to DB
        const savedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunkContent = chunks[i];

            // Generate Vector
            const vector = await generateEmbedding(chunkContent);

            // Create DB Entry
            const newChunk = await DocumentChunk.create({
                sourceFile: req.file.originalname,
                chunkIndex: i,
                text: chunkContent,
                vector: vector
            });
            savedChunks.push(newChunk);
        }

        // Clean up: Delete the local file after processing to save space
        // fs.unlinkSync(filePath); 

        res.status(200).json({
            success: true,
            message: 'PDF processed and indexed successfully',
            data: {
                filename: req.file.originalname,
                totalChunks: savedChunks.length,
                sampleChunk: savedChunks[0]?.text?.substring(0, 50) + "..."
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during processing',
            error: error.message
        });
    }
};

module.exports = { uploadPDF };