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
        const { username, email, password, role, department } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists.'
            });
        }

        // Validate role
        const validRoles = ['employee', 'manager', 'admin'];
        const userRole = (role && validRoles.includes(role.toLowerCase()))
            ? role.toLowerCase()
            : 'employee';

        // Create user
        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
            role: userRole,
            department: department || ''
        });

        // Generate token
        const token = generateToken(user);

        console.log(`[Auth] New user registered: ${user.username} (${user.role})`);

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

        console.log(`[Auth] User logged in: ${user.username} (${user.role})`);

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

module.exports = {
    register,
    login,
    getProfile,
    getAllUsers,
    updateUser
};
