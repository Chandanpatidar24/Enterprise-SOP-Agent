/**
 * SOP System Configuration
 * 
 * Central configuration for the Enterprise SOP AI system.
 * All security, access control, and pipeline settings are defined here.
 */

module.exports = {
    // ========================================
    // ROLE-BASED ACCESS CONTROL
    // ========================================

    roles: {
        // Role hierarchy - higher number = more access
        hierarchy: {
            employee: 1,
            manager: 2,
            admin: 3
        },

        // Valid roles in the system
        valid: ['employee', 'manager', 'admin'],

        // Default role for new users
        default: 'employee'
    },

    // ========================================
    // PLAN LIMITS
    // ========================================

    planLimits: {
        free: {
            maxUsers: 3,
            maxDocuments: 3
        },
        pro: {
            maxUsers: 10,
            maxDocuments: 50
        },
        enterprise: {
            maxUsers: Infinity,
            maxDocuments: Infinity
        }
    },

    // ========================================
    // DOCUMENT ACCESS LEVELS
    // ========================================

    accessLevels: {
        // Valid access levels for documents
        valid: ['employee', 'manager', 'admin'],

        // Default access level for new documents
        default: 'employee',

        // Mapping: which roles can access which levels
        // Key: user role, Value: array of accessible document levels
        roleAccess: {
            employee: ['employee'],
            manager: ['employee', 'manager'],
            admin: ['employee', 'manager', 'admin']
        }
    },

    // ========================================
    // RAG PIPELINE CONFIGURATION
    // ========================================

    rag: {
        // Vector search settings
        vectorSearch: {
            numCandidates: 100,  // Candidates to consider
            limit: 5,            // Max chunks to retrieve
            minScore: 0.6        // Minimum relevance score
        },

        // Text chunking settings
        chunking: {
            maxLength: 1000,     // Max characters per chunk
            overlap: 100         // Overlap between chunks
        },

        // Model configuration for each pipeline step
        models: {
            embedding: 'text-embedding-004',  // Gemini embedding model
            extraction: 'opsmind4',           // Model 1: Fact extraction
            generation: 'opsmind4',           // Model 2: Answer generation
            verification: 'opsmind4'          // Model 3: Compliance check
        }
    },

    // ========================================
    // SECURITY SETTINGS
    // ========================================

    security: {
        // Maximum query length to prevent abuse
        maxQueryLength: 2000,

        // Rate limiting (requests per window)
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100                   // Max requests per window
        },

        // JWT settings
        jwt: {
            expiresIn: '24h',
            algorithm: 'HS256'
        }
    },

    // ========================================
    // REFUSAL MESSAGES
    // ========================================

    messages: {
        // Standard refusal when no authorized content is found
        refusal: "This information is not available in the authorized SOP documents.",

        // When query is about restricted content
        restricted: "This information is not available in the authorized SOP documents.",

        // When verification fails
        verificationFailed: "This information is not available in the authorized SOP documents.",

        // When system error occurs
        systemError: "Unable to process your request at this time. Please try again later."
    },

    // ========================================
    // AUDIT & LOGGING
    // ========================================

    logging: {
        // Log levels: error, warn, info, debug
        level: process.env.LOG_LEVEL || 'info',

        // Whether to log pipeline details
        pipelineDetails: true,

        // Whether to log retrieved chunks (sensitive!)
        logChunks: false
    }
};
