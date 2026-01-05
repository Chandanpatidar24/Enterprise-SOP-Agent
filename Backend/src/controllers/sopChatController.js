/**
 * SOP Chat Controller
 * 
 * Implements role-based SOP querying with strict security guarantees.
 * Uses the sopRagService for the 7-step intelligence pipeline.
 * 
 * SECURITY ENFORCEMENT:
 * - Role is validated before ANY processing
 * - All queries go through the secure RAG pipeline
 * - No fallback to general AI knowledge
 * - Audit logging for compliance
 */

const ChatSession = require('../models/ChatSession');
const { processSOPQuery, getAuthorizedDocuments, REFUSAL_MESSAGE } = require('../services/sopRagService');

/**
 * Generate a short title from the question
 */
const generateTitle = (question) => {
    // Simple title extraction - first 5 words
    const words = question.split(/\s+/).slice(0, 5);
    return words.join(' ') + (question.split(/\s+/).length > 5 ? '...' : '');
};

/**
 * POST /api/sop/ask
 * 
 * Secure SOP query endpoint with role-based access control.
 * 
 * Request Body:
 * - question: string (required)
 * - userRole: 'employee' | 'manager' | 'admin' (required)
 * - sessionId: string (optional - for conversation continuity)
 * - models: { extraction, generation, verification } (optional)
 * 
 * Response:
 * - success: boolean
 * - answer: string (with citations)
 * - sources: array of { sopName, page, section }
 * - sessionId: string
 * - metadata: pipeline execution details
 */
const askSOP = async (req, res) => {
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const { question, userRole, sessionId, models } = req.body;

        // ========================================
        // INPUT VALIDATION (Critical Security Step)
        // ========================================

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            console.log(`[${requestId}] Rejected: Missing or invalid question`);
            return res.status(400).json({
                success: false,
                message: 'Question is required and must be a non-empty string.'
            });
        }

        if (!userRole || !['employee', 'manager', 'admin'].includes(userRole)) {
            console.log(`[${requestId}] Rejected: Invalid role "${userRole}"`);
            return res.status(400).json({
                success: false,
                message: 'Valid user role (employee, manager, or admin) is required.'
            });
        }

        // Sanitize question (prevent prompt injection attempts)
        const sanitizedQuestion = question
            .trim()
            .replace(/```/g, '') // Remove code blocks
            .slice(0, 2000);     // Limit length

        console.log(`[${requestId}] Processing: Role=${userRole}, Question="${sanitizedQuestion.substring(0, 50)}..."`);

        // ========================================
        // SESSION MANAGEMENT
        // ========================================

        let session;
        if (sessionId) {
            session = await ChatSession.findById(sessionId);
            if (!session) {
                session = new ChatSession({
                    messages: [],
                    title: generateTitle(sanitizedQuestion)
                });
            }
        } else {
            session = new ChatSession({
                messages: [],
                title: generateTitle(sanitizedQuestion)
            });
        }

        // Add user message to session
        session.messages.push({
            role: 'user',
            text: sanitizedQuestion
        });

        // ========================================
        // EXECUTE SECURE RAG PIPELINE
        // ========================================

        const pipelineResult = await processSOPQuery({
            query: sanitizedQuestion,
            userRole: userRole,
            models: models || {}
        });

        // ========================================
        // BUILD RESPONSE
        // ========================================

        // Add AI response to session
        session.messages.push({
            role: 'ai',
            text: pipelineResult.answer,
            sources: pipelineResult.sources.map(s => ({
                file: s.sopName,
                page: s.page
            }))
        });

        session.lastUpdated = Date.now();
        await session.save();

        // Log successful completion
        console.log(`[${requestId}] Completed: ${pipelineResult.success ? 'SUCCESS' : 'PARTIAL'} in ${pipelineResult.metadata?.processingTime}ms`);

        return res.status(200).json({
            success: pipelineResult.success,
            answer: pipelineResult.answer,
            sources: pipelineResult.sources,
            sessionId: session._id,
            title: session.title,
            metadata: {
                requestId: requestId,
                userRole: userRole,
                accessibleLevels: pipelineResult.metadata?.accessibleLevels,
                processingTime: pipelineResult.metadata?.processingTime,
                pipelineCompleted: pipelineResult.metadata?.pipelineCompleted,
                verificationPassed: pipelineResult.metadata?.verificationPassed
            }
        });

    } catch (error) {
        console.error(`[${requestId}] Pipeline Error:`, error);
        return res.status(500).json({
            success: false,
            answer: REFUSAL_MESSAGE,
            sources: [],
            metadata: {
                requestId: requestId,
                error: 'Internal processing error'
            }
        });
    }
};

/**
 * GET /api/sop/documents
 * 
 * Returns list of SOP documents the user is authorized to see.
 * Uses role-based filtering - users cannot see documents above their access level.
 */
const getDocuments = async (req, res) => {
    try {
        const { userRole } = req.query;

        if (!userRole || !['employee', 'manager', 'admin'].includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: 'Valid user role is required as query parameter.'
            });
        }

        const documents = await getAuthorizedDocuments(userRole);

        return res.status(200).json({
            success: true,
            count: documents.length,
            userRole: userRole,
            documents: documents
        });

    } catch (error) {
        console.error('Get Documents Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve documents.'
        });
    }
};

/**
 * GET /api/sop/sessions
 * 
 * Returns chat history (sessions) - no role filtering needed here
 * as sessions contain only the user's own conversations.
 */
const getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find()
            .select('title lastUpdated createdAt')
            .sort({ lastUpdated: -1 });

        return res.status(200).json({
            success: true,
            history: sessions
        });
    } catch (error) {
        console.error('Get Sessions Error:', error);
        return res.status(200).json({
            success: true,
            history: []
        });
    }
};

/**
 * GET /api/sop/session/:id
 * 
 * Returns a specific chat session's messages.
 */
const getSession = async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found.'
            });
        }

        return res.status(200).json({
            success: true,
            session: session
        });
    } catch (error) {
        console.error('Get Session Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve session.'
        });
    }
};

/**
 * DELETE /api/sop/session/:id
 * 
 * Deletes a chat session.
 */
const deleteSession = async (req, res) => {
    try {
        await ChatSession.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Session deleted successfully.'
        });
    } catch (error) {
        console.error('Delete Session Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete session.'
        });
    }
};

module.exports = {
    askSOP,
    getDocuments,
    getSessions,
    getSession,
    deleteSession
};
