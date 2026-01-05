const mongoose = require('mongoose');

/**
 * DocumentChunk Schema
 * 
 * Each chunk represents a segment of an SOP document with:
 * - Role-based access control via access_level
 * - Full attribution for citations (sop_name, page, section)
 * - Vector embeddings for semantic search
 * 
 * Access Level Hierarchy:
 * - employee: Accessible by all roles
 * - manager: Accessible by manager and admin only
 * - admin: Accessible by admin only
 */

const DocumentChunkSchema = new mongoose.Schema({
    sourceFile: {
        type: String,
        required: true,
        index: true
    },
    // Human-readable SOP name for citations
    sopName: {
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
    // Google Gemini text-embedding-004 returns 768 dimensions
    vector: {
        type: [Number],
        required: true,
        index: true
    },
    pageNumber: {
        type: Number,
        required: true
    },
    // Section identifier within the document
    section: {
        type: String,
        default: 'General'
    },
    // CRITICAL: Role-based access level
    // This is the PRIMARY security boundary for document access
    accessLevel: {
        type: String,
        required: true,
        enum: ['employee', 'manager', 'admin'],
        default: 'employee',
        index: true
    },
    category: { type: String, default: 'General' },
    version: { type: String, default: '1.0' },
    effectiveDate: { type: String },
    // Additional metadata for filtering and attribution
    metadata: {
        type: Object,
        default: {}
    },
    // Audit trail
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient role-based filtering + vector search
DocumentChunkSchema.index({ accessLevel: 1, sopName: 1 });
DocumentChunkSchema.index({ accessLevel: 1, createdAt: -1 });

module.exports = mongoose.model('DocumentChunk', DocumentChunkSchema);
