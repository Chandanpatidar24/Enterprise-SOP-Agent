const DocumentChunk = require('../models/DocumentChunk');

// 1. List all unique documents in the library
const listDocuments = async (req, res) => {
    try {
        const documents = await DocumentChunk.aggregate([
            {
                $group: {
                    _id: "$sourceFile",
                    chunkCount: { $sum: 1 },
                    lastUpdated: { $max: "$createdAt" },
                    sopName: { $first: "$sopName" },
                    accessLevel: { $first: "$accessLevel" },
                    category: { $first: "$category" },
                    version: { $first: "$version" },
                    effectiveDate: { $first: "$effectiveDate" }
                }
            },
            {
                $project: {
                    filename: "$_id",
                    _id: 0,
                    chunkCount: 1,
                    lastUpdated: 1,
                    sopName: 1,
                    accessLevel: 1,
                    category: 1,
                    version: 1,
                    effectiveDate: 1
                }
            },
            { $sort: { filename: 1 } }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            documents: documents
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Delete a document and all its indexed chunks
const deleteDocument = async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({ success: false, message: 'Filename is required' });
        }

        const result = await DocumentChunk.deleteMany({ sourceFile: filename });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({
            success: true,
            message: `Deleted document "${filename}" and its ${result.deletedCount} chunks.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update document metadata
const updateDocument = async (req, res) => {
    try {
        const { filename } = req.params;
        const { accessLevel, category, version, effectiveDate } = req.body;

        if (!filename) {
            return res.status(400).json({ success: false, message: 'Filename is required' });
        }

        // Build update object
        const updateFields = {};
        if (accessLevel) updateFields.accessLevel = accessLevel;
        if (category) updateFields.category = category;
        if (version) updateFields.version = version;
        if (effectiveDate) updateFields.effectiveDate = effectiveDate;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        // Update all chunks mapping to this file
        const result = await DocumentChunk.updateMany(
            { sourceFile: filename },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({
            success: true,
            message: `Updated ${result.modifiedCount} chunks for document "${filename}".`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { listDocuments, deleteDocument, updateDocument };
