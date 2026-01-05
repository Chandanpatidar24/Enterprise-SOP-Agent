/**
 * Authentication & Authorization Middleware
 * 
 * Provides JWT-based authentication and role-based access control.
 * This middleware enforces role verification at the API layer.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT Token
 * @param {Object} user - User document
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Middleware: Authenticate Request
 * Verifies JWT token and attaches user to request.
 * 
 * Usage: router.get('/protected', authenticate, handler)
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or account is inactive.'
            });
        }

        // Attach user to request
        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Middleware: Authorize Role
 * Ensures user has the required role level.
 * 
 * Usage: router.get('/admin-only', authenticate, authorize('admin'), handler)
 * 
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.'
            });
        }

        next();
    };
};

/**
 * Middleware: Extract Role from Body
 * For endpoints that receive role in request body (like /api/sop/ask)
 * Validates and normalizes the role.
 * 
 * Usage: router.post('/ask', validateRole, handler)
 */
const validateRole = (req, res, next) => {
    const { userRole } = req.body;

    if (!userRole) {
        return res.status(400).json({
            success: false,
            message: 'User role is required.'
        });
    }

    const normalizedRole = userRole.toLowerCase();

    if (!['employee', 'manager', 'admin'].includes(normalizedRole)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be employee, manager, or admin.'
        });
    }

    // Normalize role in body
    req.body.userRole = normalizedRole;
    next();
};

/**
 * Middleware: Extract Role from Query
 * For GET endpoints that receive role in query params
 * 
 * Usage: router.get('/documents', validateRoleQuery, handler)
 */
const validateRoleQuery = (req, res, next) => {
    const { userRole } = req.query;

    if (!userRole) {
        return res.status(400).json({
            success: false,
            message: 'User role query parameter is required.'
        });
    }

    const normalizedRole = userRole.toLowerCase();

    if (!['employee', 'manager', 'admin'].includes(normalizedRole)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be employee, manager, or admin.'
        });
    }

    // Normalize role in query
    req.query.userRole = normalizedRole;
    next();
};

/**
 * Middleware: Admin Only
 * Shortcut for requiring admin role
 */
const adminOnly = [authenticate, authorize('admin')];

/**
 * Middleware: Manager or Admin
 * Shortcut for requiring at least manager level
 */
const managerOrAdmin = [authenticate, authorize('manager', 'admin')];

module.exports = {
    generateToken,
    authenticate,
    authorize,
    validateRole,
    validateRoleQuery,
    adminOnly,
    managerOrAdmin,
    JWT_SECRET
};
