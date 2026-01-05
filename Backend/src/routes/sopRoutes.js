/**
 * SOP Routes
 * 
 * Secure endpoints for the SOP AI system with role-based access control.
 * All query endpoints require userRole parameter for access filtering.
 */

const express = require('express');
const router = express.Router();
const {
    askSOP,
    getDocuments,
    getSessions,
    getSession,
    deleteSession
} = require('../controllers/sopChatController');

// ========================================
// QUERY ENDPOINTS (Role-Based)
// ========================================

/**
 * POST /api/sop/ask
 * Submit a question to the SOP AI system
 * Body: { question, userRole, sessionId?, models? }
 */
router.post('/ask', askSOP);

/**
 * GET /api/sop/documents?userRole=employee|manager|admin
 * Get list of authorized SOP documents for the user's role
 */
router.get('/documents', getDocuments);

// ========================================
// SESSION MANAGEMENT
// ========================================

/**
 * GET /api/sop/sessions
 * Get all chat sessions
 */
router.get('/sessions', getSessions);

/**
 * GET /api/sop/session/:id
 * Get a specific chat session
 */
router.get('/session/:id', getSession);

/**
 * DELETE /api/sop/session/:id
 * Delete a chat session
 */
router.delete('/session/:id', deleteSession);

module.exports = router;
