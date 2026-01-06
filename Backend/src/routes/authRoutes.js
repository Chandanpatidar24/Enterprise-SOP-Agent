/**
 * Authentication Routes
 * 
 * Handles user authentication and management endpoints.
 */

const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    getAllUsers,
    updateUser,
    upgradeOrganization,
    deleteAccount
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// ========================================
// PUBLIC ROUTES
// ========================================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login and get JWT token
 */
router.post('/login', login);

// ========================================
// PROTECTED ROUTES (Require Authentication)
// ========================================

/**
 * GET /api/auth/me
 * Get current user's profile
 */
router.get('/me', authenticate, getProfile);

/**
 * PATCH /api/auth/upgrade-organization
 * Upgrade a personal organization to enterprise
 */
router.patch('/upgrade-organization', authenticate, upgradeOrganization);

/**
 * DELETE /api/auth/account
 * Delete current user's account and data
 */
router.delete('/account', authenticate, deleteAccount);

// ========================================
// ADMIN ROUTES
// ========================================

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticate, authorize('admin'), getAllUsers);

/**
 * PUT /api/auth/users/:id
 * Update a user (Admin only)
 */
router.put('/users/:id', authenticate, authorize('admin'), updateUser);

module.exports = router;
