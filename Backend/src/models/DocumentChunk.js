const mongoose = require('mongoose');

const DocumentChunkSchema = new mongoose.Schema({
    sourceFile: {
        type: String,
        required: true,
        index: true
    },
    chunkIndex: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    // The Vector Embedding (Array of numbers)
    // Google Gemini usually returns 768 dimensions for 'embedding-001'
    vector: {
        type: [Number],
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DocumentChunk', DocumentChunkSchema);
