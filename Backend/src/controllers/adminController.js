const DocumentChunk = require('../models/DocumentChunk');
const User = require('../models/User');

// List all users in the admin's company
const listUsers = async (req, res) => {
    try {
        // Only admins can list users
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can view user list.'
            });
        }

        // Query: Get users with same companyId OR users without companyId (legacy accounts)
        const query = req.user.companyId
            ? { $or: [{ companyId: req.user.companyId }, { companyId: { $exists: false } }, { companyId: null }] }
            : {}; // If admin has no companyId, show all users (for testing/legacy)

        const users = await User.find(query)
            .select('_id username email role isActive createdAt lastLogin companyId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users: users.map(u => ({
                id: u._id,
                name: u.username || u.email.split('@')[0],
                email: u.email,
                role: u.role,
                isActive: u.isActive,
                createdAt: u.createdAt,
                lastLogin: u.lastLogin
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Only admins can update roles
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update user roles.'
            });
        }

        // Validate role
        const validRoles = ['employee', 'manager', 'admin', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: employee, manager, admin, user'
            });
        }

        // Prevent admin from demoting themselves
        if (userId === req.user._id.toString() && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'You cannot demote yourself from admin role.'
            });
        }

        const user = await User.findOneAndUpdate(
            { _id: userId, companyId: req.user.companyId },
            { role, updatedAt: Date.now() },
            { new: true }
        ).select('_id username email role');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user: {
                id: user._id,
                name: user.username || user.email.split('@')[0],
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. List all unique documents in the library
const listDocuments = async (req, res) => {
    try {
        const documents = await DocumentChunk.aggregate([
            { $match: { companyId: req.user.companyId } }, // Match by company first
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
        const Organization = require('../models/Organization');

        if (!filename) {
            return res.status(400).json({ success: false, message: 'Filename is required' });
        }

        // 1. Check if organization type is enterprise and user is not admin
        const org = await Organization.findById(req.user.companyId);
        if (org && org.type === 'enterprise' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can delete company documents.'
            });
        }

        const result = await DocumentChunk.deleteMany({
            sourceFile: filename,
            companyId: req.user.companyId // Ensure only company's docs are deleted
        });

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

        // 1. Check if organization type is enterprise and user is not admin
        const Organization = require('../models/Organization');
        const org = await Organization.findById(req.user.companyId);
        if (org && org.type === 'enterprise' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update company documents.'
            });
        }

        // Update all chunks mapping to this file and company
        const result = await DocumentChunk.updateMany(
            {
                sourceFile: filename,
                companyId: req.user.companyId
            },
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

module.exports = { listDocuments, deleteDocument, updateDocument, listUsers, updateUserRole };
