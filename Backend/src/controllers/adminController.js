const DocumentChunk = require('../models/DocumentChunk');

// 1. List all unique documents in the library
const listDocuments = async (req, res) => {
    try {
        const documents = await DocumentChunk.aggregate([
            {
                $group: {
                    _id: "$sourceFile",
                    chunkCount: { $sum: 1 },
                    lastUpdated: { $max: "$createdAt" }
                }
            },
            {
                $project: {
                    filename: "$_id",
                    _id: 0,
                    chunkCount: 1,
                    lastUpdated: 1
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

module.exports = { listDocuments, deleteDocument };
