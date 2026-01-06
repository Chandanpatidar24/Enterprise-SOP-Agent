/**
 * Upload Controller
 * 
 * Handles PDF uploads with role-based access level tagging.
 * Each uploaded document is tagged with an access level for the security filter.
 * 
 * CRITICAL: Access level must be specified at upload time.
 * This determines which roles can access the document content.
 */

const { parsePDF, chunkText } = require('../utils/textProcessor');
const { generateEmbedding } = require('../utils/aiService');
const DocumentChunk = require('../models/DocumentChunk');
const fs = require('fs');

// Valid access levels for documents
const VALID_ACCESS_LEVELS = ['employee', 'manager', 'admin'];

/**
 * POST /api/upload
 * 
 * Upload a PDF with access level tagging for role-based retrieval.
 * 
 * Form Data:
 * - file: PDF file (required)
 * - accessLevel: 'employee' | 'manager' | 'admin' (required)
 * - sopName: Human-readable SOP name (optional, defaults to filename)
 * - section: Default section name (optional, defaults to 'General')
 */
const uploadPDF = async (req, res) => {
    try {
        // Validate file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file.'
            });
        }

        // Extract and validate access level
        // For Personal users, we default to 'employee' access or similar, but since it's isolated by companyId, it's safe.
        const accessLevel = req.user.role === 'user' ? 'employee' : (req.body.accessLevel?.toLowerCase() || 'employee');

        if (!VALID_ACCESS_LEVELS.includes(accessLevel)) {
            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: `Invalid access level. Must be one of: ${VALID_ACCESS_LEVELS.join(', ')}`
            });
        }

        // Extract optional metadata
        const sopName = req.body.sopName?.trim() || req.file.originalname.replace('.pdf', '');
        const defaultSection = req.body.section?.trim() || 'General';

        const filePath = req.file.path;
        console.log(`[Upload] Processing: ${req.file.originalname} | Access Level: ${accessLevel}`);

        // 1. Parse PDF
        const { pages } = await parsePDF(filePath);
        if (!pages || pages.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Could not extract text from PDF. Ensure the PDF contains readable text.'
            });
        }

        // 2. Chunk text and save to DB with access level
        const savedChunks = [];
        let totalChunkCount = 0;

        for (let p = 0; p < pages.length; p++) {
            const pageText = pages[p];
            const pageNumber = p + 1;
            const chunks = chunkText(pageText);

            for (let i = 0; i < chunks.length; i++) {
                const chunkContent = chunks[i];

                // Generate embedding vector
                const vector = await generateEmbedding(chunkContent);

                // Create DB entry with access control metadata
                const newChunk = await DocumentChunk.create({
                    sourceFile: req.file.originalname,
                    sopName: sopName,
                    chunkIndex: totalChunkCount++,
                    text: chunkContent,
                    vector: vector,
                    pageNumber: pageNumber,
                    section: defaultSection,
                    accessLevel: accessLevel, // CRITICAL: Role-based access tag
                    companyId: req.user.companyId, // CRITICAL: Company isolation tag
                    category: req.body.category || 'General',
                    version: req.body.version || '1.0',
                    effectiveDate: req.body.effectiveDate,
                    metadata: {
                        uploadedAt: new Date(),
                        originalFilename: req.file.originalname,
                        mimeType: req.file.mimetype,
                        size: req.file.size
                    }
                });
                savedChunks.push(newChunk);
            }
        }

        // Clean up: Delete the local file after processing
        fs.unlinkSync(filePath);

        console.log(`[Upload] Complete: ${savedChunks.length} chunks created for "${sopName}" with access level "${accessLevel}"`);

        res.status(200).json({
            success: true,
            message: 'PDF processed and indexed successfully',
            data: {
                filename: req.file.originalname,
                sopName: sopName,
                accessLevel: accessLevel,
                section: defaultSection,
                totalChunks: savedChunks.length,
                sampleChunk: savedChunks[0]?.text?.substring(0, 100) + "..."
            }
        });

    } catch (error) {
        console.error('[Upload] Error:', error);

        // Clean up file on error
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Server error during processing',
            error: error.message
        });
    }
};

/**
 * POST /api/upload/batch
 * 
 * Upload multiple SOPs with individual access levels.
 * (Future enhancement - placeholder for bulk operations)
 */
const uploadBatch = async (req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Batch upload not yet implemented. Use single upload endpoint.'
    });
};

module.exports = { uploadPDF, uploadBatch };