/**
 * User Authentication Controller
 * 
 * Handles user registration, login, and profile management.
 * Integrates with the role-based access control system.
 */

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * 
 * Register a new user (Admin only in production).
 */
const register = async (req, res) => {
    try {
        const { username, email, password, signupType, companyName, plan } = req.body;

        // 1. Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required.'
            });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists.'
            });
        }

        // 3. Multi-Tenancy Logic (Personal vs Enterprise)
        const Organization = require('../models/Organization');
        let companyId;
        let finalRole = 'user'; // Default for personal usage

        if (signupType === 'enterprise' || companyName) {
            // Enterprise Path
            const slug = (companyName || `${username}-org`).toLowerCase().replace(/[^a-z0-9]/g, '-');

            let org = await Organization.findOne({ slug });
            if (!org) {
                org = await Organization.create({
                    name: companyName || `${username}'s Org`,
                    slug: slug,
                    adminEmail: email.toLowerCase(),
                    type: 'enterprise',
                    plan: plan || 'free'
                });
            }
            companyId = org._id;
            finalRole = 'admin'; // Owner of the new enterprise org
        } else {
            // Personal Path
            const personalOrgName = `${username}'s Library`;
            const slug = `personal-${username.toLowerCase()}-${Date.now()}`;

            const org = await Organization.create({
                name: personalOrgName,
                slug: slug,
                adminEmail: email.toLowerCase(),
                type: 'personal',
                plan: 'free'
            });
            companyId = org._id;
            finalRole = 'user'; // Individual user
        }

        // 4. Create User with correct isolation
        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
            role: finalRole,
            companyId: companyId
        });

        // Generate token
        const token = generateToken(user);

        console.log(`[Auth] New user registered: ${user.username} (${user.role}) Type: ${signupType || 'personal'}`);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department
            },
            token: token
        });

    } catch (error) {
        console.error('[Auth] Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

/**
 * POST /api/auth/login
 * 
 * Authenticate user and return JWT token.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Find user (include password for comparison)
        const user = await User.findOne({
            email: email.toLowerCase()
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive. Please contact an administrator.'
            });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user);

        console.log(`[Auth] User logged in: ${user.username || user.email} (${user.role})`);

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department
            },
            token: token
        });

    } catch (error) {
        console.error('[Auth] Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

/**
 * GET /api/auth/me
 * 
 * Get current user's profile (requires authentication).
 */
const getProfile = async (req, res) => {
    try {
        // req.user is set by authenticate middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('[Auth] Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile.'
        });
    }
};

/**
 * GET /api/auth/users (Admin only)
 * 
 * Get all users in the system.
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('[Auth] Get users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve users.'
        });
    }
};

/**
 * PUT /api/auth/users/:id (Admin only)
 * 
 * Update a user's role or status.
 */
const updateUser = async (req, res) => {
    try {
        const { role, isActive, department } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Update fields
        if (role && ['employee', 'manager', 'admin'].includes(role.toLowerCase())) {
            user.role = role.toLowerCase();
        }

        if (typeof isActive === 'boolean') {
            user.isActive = isActive;
        }

        if (department !== undefined) {
            user.department = department;
        }

        user.updatedAt = Date.now();
        await user.save();

        console.log(`[Auth] User updated: ${user.username} by admin`);

        return res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('[Auth] Update user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user.'
        });
    }
};

/**
 * PATCH /api/auth/upgrade-organization
 * 
 * Upgrade a personal organization to enterprise.
 */
const upgradeOrganization = async (req, res) => {
    try {
        const { companyName, plan } = req.body;

        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required for enterprise upgrade.'
            });
        }

        // 1. Find the current user's organization
        const Organization = require('../models/Organization');
        const org = await Organization.findById(req.user.companyId);

        if (!org) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found.'
            });
        }

        if (org.type === 'enterprise') {
            return res.status(400).json({
                success: false,
                message: 'Organization is already an enterprise account.'
            });
        }

        // 2. Update Organization details
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Check if slug is already taken (different from current one)
        const existingOrg = await Organization.findOne({ slug, _id: { $ne: org._id } });
        if (existingOrg) {
            return res.status(409).json({
                success: false,
                message: 'This company name is already registered.'
            });
        }

        org.name = companyName;
        org.slug = slug;
        org.type = 'enterprise';
        org.plan = plan || 'free';
        org.subscriptionStatus = 'trial'; // Start a fresh trial for the new enterprise org
        await org.save();

        // 3. Upgrade user to admin (if they are currently just a personal user)
        const user = await User.findById(req.user.id);
        if (user) {
            user.role = 'admin';
            await user.save();
        }

        console.log(`[Auth] Workspace upgraded: ${org.name} (Admin: ${user.username})`);

        return res.status(200).json({
            success: true,
            message: 'Workspace upgraded to enterprise successfully.',
            data: {
                organizationName: org.name,
                type: org.type,
                plan: org.plan,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[Auth] Upgrade error:', error);
        return res.status(500).json({
            success: false,
            message: 'Upgrade failed. Please try again.'
        });
    }
};

/**
 * DELETE /api/auth/account
 * 
 * Permanently delete the user's account and all associated data.
 */
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.companyId;

        // 1. Delete all user data
        const ChatSession = require('../models/ChatSession');
        const DocumentChunk = require('../models/DocumentChunk');
        const Organization = require('../models/Organization');

        await ChatSession.deleteMany({ userId });

        // If they are an admin or personal user, we might want to delete org-wide data
        // For simplicity and safety for now, we delete documents tied to their specific companyId
        // IF they are the only user or it's a personal account.
        const org = await Organization.findById(companyId);
        if (org && (org.type === 'personal' || (org.type === 'enterprise' && req.user.role === 'admin'))) {
            await DocumentChunk.deleteMany({ companyId });
            await Organization.findByIdAndDelete(companyId);
        }

        // 2. Delete the user
        await User.findByIdAndDelete(userId);

        console.log(`[Auth] Account deleted: ${req.user.username} (${userId})`);

        return res.status(200).json({
            success: true,
            message: 'Account and associated data deleted successfully.'
        });

    } catch (error) {
        console.error('[Auth] Account deletion error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete account. Please try again.'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    getAllUsers,
    updateUser,
    upgradeOrganization,
    deleteAccount
};
