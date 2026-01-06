const DocumentChunk = require('../models/DocumentChunk');
const User = require('../models/User');
const Organization = require('../models/Organization');

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
            .populate('companyId', 'name type plan')
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
                lastLogin: u.lastLogin,
                orgType: u.companyId?.type || 'personal',
                orgName: u.companyId?.name || 'Personal'
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
        const adminUserId = req.user && req.user._id ? String(req.user._id) : null;
        if (adminUserId && userId === adminUserId && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'You cannot demote yourself from admin role.'
            });
        }

        // Find user first - check if they belong to admin's company or have no company (legacy)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify user belongs to admin's org or is a legacy user
        const userCompanyId = user.companyId ? String(user.companyId) : null;
        const adminCompanyId = req.user && req.user.companyId ? String(req.user.companyId) : null;

        // Only block if both have companyId and they're different
        if (userCompanyId && adminCompanyId && userCompanyId !== adminCompanyId) {
            return res.status(403).json({ success: false, message: 'Cannot update user from different organization' });
        }

        // Update the role
        user.role = role;
        user.updatedAt = Date.now();
        await user.save();

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

// Create a new user (Admin only)
const createUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        // Only admins can create users
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can create users.'
            });
        }

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // Validate role
        const validRoles = ['employee', 'manager', 'admin'];
        const finalRole = validRoles.includes(role) ? role : 'employee';

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

        // Create the user with admin's companyId
        const user = await User.create({
            username: name?.toLowerCase().replace(/\s+/g, '') || email.split('@')[0],
            email: email.toLowerCase(),
            password: tempPassword,
            role: finalRole,
            companyId: req.user.companyId
        });

        console.log(`[Admin] User created: ${user.email} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            user: {
                id: user._id,
                name: user.username || email.split('@')[0],
                email: user.email,
                role: user.role,
                orgType: 'personal'
            },
            tempPassword: tempPassword // Send to admin so they can share with user
        });
    } catch (error) {
        console.error('[Admin] Create user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user's organization type
const updateUserOrgType = async (req, res) => {
    try {
        const { userId } = req.params;
        const { orgType } = req.body;

        // Only admins can update org type
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update organization type.'
            });
        }

        // Validate orgType
        const validTypes = ['personal', 'enterprise'];
        if (!validTypes.includes(orgType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid organization type. Must be personal or enterprise.'
            });
        }

        // Find the user
        const user = await User.findById(userId).populate('companyId');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update the organization type
        if (user.companyId) {
            await Organization.findByIdAndUpdate(user.companyId._id, { type: orgType });
        } else {
            // Create a new organization for this user
            const org = await Organization.create({
                name: `${user.username || user.email.split('@')[0]}'s Org`,
                slug: `org-${user._id}`,
                adminEmail: user.email,
                type: orgType,
                plan: 'free'
            });
            user.companyId = org._id;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: `Organization type updated to ${orgType}`,
            orgType: orgType
        });
    } catch (error) {
        console.error('[Admin] Update org type error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Only admins can delete users
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can delete users.'
            });
        }

        // Prevent admin from deleting themselves
        const adminUserId = req.user && req.user._id ? String(req.user._id) : null;
        if (adminUserId && userId === adminUserId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account from here.'
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        console.log(`[Admin] User deleted: ${user.email} by admin`);

        res.status(200).json({
            success: true,
            message: `User ${user.email} has been deleted.`
        });
    } catch (error) {
        console.error('[Admin] Delete user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. List all unique documents in the library
const listDocuments = async (req, res) => {
    try {
        // Match logic:
        // 1. If admin has companyId: Show company docs + legacy docs (no companyId)
        // 2. If admin has NO companyId: Show all docs (assuming super admin or legacy mode)
        const matchQuery = req.user.companyId
            ? { $or: [{ companyId: req.user.companyId }, { companyId: null }, { companyId: { $exists: false } }] }
            : {};

        const documents = await DocumentChunk.aggregate([
            { $match: matchQuery }, // Improved match
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

module.exports = { listDocuments, deleteDocument, updateDocument, listUsers, updateUserRole, createUser, updateUserOrgType, deleteUser };
