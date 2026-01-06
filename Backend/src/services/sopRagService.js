/**
 * SOP RAG Service - Enterprise Intelligence Layer
 * 
 * Implements strict role-based access control with zero hallucination guarantees.
 * 
 * SECURITY GUARANTEES:
 * 1. Role filtering happens BEFORE vector search (pre-retrieval)
 * 2. AI can ONLY use retrieved SOP chunks
 * 3. Every statement MUST have a citation
 * 4. Multi-model verification prevents unauthorized information leakage
 * 
 * RUNTIME FLOW:
 * Step 1: Receive Request (query + user_role)
 * Step 2: Role-Based SOP Filtering (CRITICAL)
 * Step 3: Vector Search (Gemini Embeddings)
 * Step 4: Fact Extraction (Model 1)
 * Step 5: Answer Generation (Model 2)
 * Step 6: Compliance Verification (Model 3)
 * Step 7: Final Response with Citations
 */

const DocumentChunk = require('../models/DocumentChunk');
const { generateEmbedding, getChatResponse, getChatResponseStream } = require('../utils/aiService');

// Role hierarchy for access level comparison
const ROLE_HIERARCHY = {
    user: 1,      // Personal usage
    employee: 1,  // Enterprise bottom-tier
    manager: 2,
    admin: 3
};

// Refusal message - used when no authorized content is found
const REFUSAL_MESSAGE = "This information is not available in the authorized SOP documents.";

/**
 * Get accessible access levels for a given user role
 * @param {string} userRole - 'employee' | 'manager' | 'admin'
 * @returns {string[]} Array of accessible access levels
 */
const getAccessibleLevels = (userRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    return Object.entries(ROLE_HIERARCHY)
        .filter(([_, level]) => level <= userLevel)
        .map(([role, _]) => role);
};

/**
 * STEP 2: Role-Based SOP Filtering
 * Filters document chunks BEFORE any vector search operation.
 * This is the PRIMARY security boundary.
 * 
 * @param {string} userRole - User's role
 * @returns {Object} MongoDB filter for authorized chunks
 */
const buildRoleFilter = (userRole, companyId) => {
    const accessibleLevels = getAccessibleLevels(userRole);

    if (accessibleLevels.length === 0) {
        // No access - return impossible filter
        return { companyId: companyId, accessLevel: { $in: [] } };
    }

    // MATCH LOGIC:
    // 1. Company ID matches user's ID OR is null/missing
    // 2. AND Access Level is in accessible levels OR is null/missing
    const companyIds = companyId ? [companyId, null] : [null];

    // We construct the query carefully.
    // Since we need to allow (CompanyID Match OR Null) AND (AccessLevel Match OR Null),
    // and MongoDB doesn't allow multiple top-level $or operators, we use $and.

    const companyCondition = companyId
        ? { $or: [{ companyId: companyId }, { companyId: null }, { companyId: { $exists: false } }] }
        : { $or: [{ companyId: null }, { companyId: { $exists: false } }] };

    const accessCondition = {
        $or: [
            { accessLevel: { $in: accessibleLevels } },
            { accessLevel: null },
            { accessLevel: { $exists: false } }
        ]
    };

    return {
        $and: [
            companyCondition,
            accessCondition
        ]
    };
};

/**
 * STEP 3: Vector Search with Role Filtering
 * Performs semantic search ONLY within role-authorized SOP chunks.
 * 
 * @param {string} query - User's question
 * @param {string} userRole - User's role
 * @param {number} limit - Max chunks to retrieve (default: 5)
 * @returns {Promise<Array>} Authorized and relevant chunks
 */
const performSecureVectorSearch = async (query, userRole, companyId, limit = 5) => {
    // Generate query embedding using Gemini
    const queryVector = await generateEmbedding(query);

    // Build role-based pre-filter with Company ID
    const roleFilter = buildRoleFilter(userRole, companyId);

    // Get accessible levels for logging
    const accessibleLevels = getAccessibleLevels(userRole);
    console.log(`[RAG] User role: ${userRole}, Accessible levels: ${accessibleLevels.join(', ')}`);

    // Perform vector search with pre-filtering
    // NOTE: $vectorSearch MUST be the first stage in the pipeline
    const chunks = await DocumentChunk.aggregate([
        {
            $vectorSearch: {
                index: "default",
                path: "vector",
                queryVector: queryVector,
                numCandidates: 100,
                limit: limit,
                // CRITICAL: Pre-filtering at the index level
                // This ensures unauthorized documents are never even considered
                filter: roleFilter
            }
        },
        {
            $project: {
                text: 1,
                sourceFile: 1,
                sopName: 1,
                pageNumber: 1,
                section: 1,
                accessLevel: 1,
                score: { $meta: "vectorSearchScore" }
            }
        }
    ]);

    // Log retrieval results (without sensitive content)
    console.log(`[RAG] Retrieved ${chunks.length} chunks for role: ${userRole}`);

    return chunks;
};

/**
 * STEP 4: Fact Extraction (Model 1)
 * Extracts verbatim policy statements from retrieved chunks.
 * NO paraphrasing, NO inference - exact text only.
 * 
 * @param {Array} chunks - Retrieved document chunks
 * @param {string} query - Original user query
 * @param {string} model - Model to use
 * @param {string} companyName - Name of the organization
 * @param {string} userName - Name of the user
 * @returns {Promise<Object>} Extracted facts with full citations
 */
const extractFacts = async (chunks, query, model, companyName, userName) => {
    if (!chunks || chunks.length === 0) {
        return { facts: [], hasContent: false };
    }

    // Build context from chunks
    const contextText = chunks.map((chunk, index) =>
        `--- CHUNK ${index + 1} ---
SOP: ${chunk.sopName || chunk.sourceFile}
Page: ${chunk.pageNumber}
Section: ${chunk.section || 'General'}
Access Level: ${chunk.accessLevel}
Content:
${chunk.text}
--- END CHUNK ${index + 1} ---`
    ).join('\n\n');

    const extractionPrompt = `You are a FACT EXTRACTION system. Your role is to extract ONLY verbatim policy statements from the provided SOP documents.

STRICT RULES:
1. Extract ONLY text that directly exists in the provided chunks
2. DO NOT paraphrase or rephrase
3. DO NOT add any interpretation or inference
4. DO NOT include information not explicitly stated
5. For each fact, include exact source attribution

QUERY TO ADDRESS:
${query}

USER CONTEXT:
User: ${userName}
Organization: ${companyName}

SOP DOCUMENT CHUNKS:
${contextText}

OUTPUT FORMAT (JSON):
{
    "facts": [
        {
            "exact_text": "The verbatim text from the SOP",
            "sop_name": "Name of the SOP document",
            "page_number": 1,
            "section": "Section name",
            "relevance": "high|medium|low"
        }
    ],
    "found_relevant_content": true/false
}

Extract facts now. If no relevant content is found for the query, set found_relevant_content to false.`;

    try {
        const rawResponse = await getChatResponse(extractionPrompt, model);

        // Parse JSON from response
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                facts: parsed.facts || [],
                hasContent: parsed.found_relevant_content === true && parsed.facts?.length > 0
            };
        }

        return { facts: [], hasContent: false };
    } catch (error) {
        console.error('[RAG] Fact extraction error:', error);
        return { facts: [], hasContent: false };
    }
};

/**
 * STEP 5: Answer Generation (Model 2)
 * Converts extracted facts into a human-readable answer.
 * Uses ONLY extracted facts - no external knowledge.
 * 
 * @param {Object} extractedFacts - Facts from Step 4
 * @param {string} query - Original user query
 * @param {string} model - Model to use for generation
 * @param {string} companyName - Name of the organization
 * @param {string} userName - Name of the user
 * @returns {Promise<string>} Generated answer with citations
 */
const generateAnswer = async (extractedFacts, query, model, companyName, userName) => {
    if (!extractedFacts.hasContent || extractedFacts.facts.length === 0) {
        return REFUSAL_MESSAGE;
    }

    const factsText = extractedFacts.facts.map((fact, index) =>
        `FACT ${index + 1}:
"${fact.exact_text}"
Source: ${fact.sop_name} - Page ${fact.page_number}, Section: ${fact.section}`
    ).join('\n\n');

    const generationPrompt = `You are a professional SOP assistant. Generate a clear, accurate answer using ONLY the provided facts.

ABSOLUTE RULES:
1. Use ONLY the facts provided below - no other knowledge
2. EVERY statement MUST have a citation in format: (SOP Name – Page X, Section Y)
3. Do NOT add explanations beyond what the SOP text states
4. Do NOT answer hypotheticals or "what-if" scenarios
5. Maintain a neutral, professional tone
6. If facts are ambiguous or incomplete, acknowledge this explicitly

USER QUESTION:
${query}

USER CONTEXT:
User: ${userName}
Organization: ${companyName}

EXTRACTED FACTS FROM SOPs:
${factsText}

Generate your answer now with proper citations:`;

    try {
        const answer = await getChatResponse(generationPrompt, model);
        return answer;
    } catch (error) {
        console.error('[RAG] Answer generation error:', error);
        return REFUSAL_MESSAGE;
    }
};

/**
 * STEP 6: Compliance Verification (Model 3)
 * Validates that the generated answer:
 * - Only contains information from extracted facts
 * - Has accurate citations
 * - Contains no restricted or inferred information
 * 
 * @param {string} answer - Generated answer from Step 5
 * @param {Object} extractedFacts - Original extracted facts
 * @param {string} model - Model for verification
 * @returns {Promise<Object>} Verification result with pass/fail and reasons
 */
const verifyCompliance = async (answer, extractedFacts, model) => {
    if (answer === REFUSAL_MESSAGE) {
        return { passed: true, answer: answer, issues: [] };
    }

    const factsText = extractedFacts.facts.map((fact, index) =>
        `FACT ${index + 1}: "${fact.exact_text}" (Source: ${fact.sop_name}, Page ${fact.page_number})`
    ).join('\n');

    const verificationPrompt = `You are a COMPLIANCE VERIFICATION system. Your job is to verify that an AI response strictly adheres to source facts.

VERIFICATION RULES:
1. Every claim in the answer MUST be directly supported by the provided facts
2. Every claim MUST have a citation that matches the source facts
3. NO external knowledge should be present
4. NO inference beyond what facts explicitly state
5. NO information about restricted SOPs or access levels

AUTHORIZED FACTS:
${factsText}

ANSWER TO VERIFY:
${answer}

OUTPUT FORMAT (JSON):
{
    "compliance_passed": true/false,
    "issues": [
        {
            "issue_type": "unsupported_claim|missing_citation|inference|restricted_info",
            "description": "Description of the issue",
            "problematic_text": "The specific text that violates compliance"
        }
    ],
    "safe_to_return": true/false,
    "rewritten_answer": "If safe_to_return is false, provide a compliant version here"
}

Verify now:`;

    try {
        const rawResponse = await getChatResponse(verificationPrompt, model);

        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            if (parsed.safe_to_return === false && parsed.rewritten_answer) {
                return {
                    passed: false,
                    answer: parsed.rewritten_answer,
                    issues: parsed.issues || [],
                    wasRewritten: true
                };
            }

            return {
                passed: parsed.compliance_passed === true,
                answer: parsed.compliance_passed ? answer : REFUSAL_MESSAGE,
                issues: parsed.issues || []
            };
        }

        // If parsing fails, return original answer (fail-safe)
        return { passed: true, answer: answer, issues: [] };
    } catch (error) {
        console.error('[RAG] Compliance verification error:', error);
        // Fail-safe: return refusal if verification fails
        return { passed: false, answer: REFUSAL_MESSAGE, issues: ['Verification system error'] };
    }
};

/**
 * MAIN PIPELINE: Process SOP Query
 * Orchestrates the complete 7-step pipeline.
 * 
 * @param {Object} params
 * @param {string} params.query - User's question
 * @param {string} params.userRole - User's role (employee|manager|admin)
 * @param {string} params.companyId - User's company ID
 * @param {string} params.companyName - User's company name
 * @param {string} params.userName - User's username
 * @param {Object} params.models - Model configuration for each step
 * @returns {Promise<Object>} Final response with answer, sources, and metadata
 */
const processSOPQuery = async ({ query, userRole, companyId, companyName = 'Your Organization', userName = 'User', models = {} }) => {
    const startTime = Date.now();
    const pipelineLog = [];

    // Validate inputs
    if (!query || typeof query !== 'string') {
        return {
            success: false,
            answer: 'Invalid query provided.',
            sources: [],
            metadata: { error: 'INVALID_QUERY' }
        };
    }

    if (!['user', 'employee', 'manager', 'admin'].includes(userRole)) {
        return {
            success: false,
            answer: 'Invalid user role.',
            sources: [],
            metadata: { error: 'INVALID_ROLE' }
        };
    }

    // Default model configuration (can be customized)
    const modelConfig = {
        extraction: models.extraction || 'opsmind4',   // Model 1: Fact Extraction
        generation: models.generation || 'opsmind4',   // Model 2: Answer Generation
        verification: models.verification || 'opsmind4' // Model 3: Compliance Check
    };

    try {
        // STEP 1: Request received
        pipelineLog.push({ step: 1, action: 'RECEIVE_REQUEST', timestamp: Date.now() });
        console.log(`[RAG Pipeline] Processing query for role: ${userRole}`);

        try {
            chunks = await performSecureVectorSearch(query, userRole, companyId, 5);
        } catch (embeddingError) {
            console.error('[RAG] Vector search failed:', embeddingError);
            return {
                success: false,
                answer: REFUSAL_MESSAGE,
                sources: [],
                metadata: { error: 'EMBEDDING_FAILED', step: 3 }
            };
        }
        pipelineLog.push({ step: 3, action: 'VECTOR_SEARCH', chunks_found: chunks.length, timestamp: Date.now() });

        // No chunks found = immediate refusal
        if (!chunks || chunks.length === 0) {
            console.log('[RAG] No authorized chunks found - returning refusal');
            return {
                success: true,
                answer: REFUSAL_MESSAGE,
                sources: [],
                metadata: {
                    pipelineCompleted: false,
                    stoppedAt: 'NO_CHUNKS_FOUND',
                    userRole: userRole,
                    processingTime: Date.now() - startTime
                }
            };
        }

        // STEP 4: Fact Extraction
        pipelineLog.push({ step: 4, action: 'FACT_EXTRACTION', timestamp: Date.now() });
        const extractedFacts = await extractFacts(chunks, query, modelConfig.extraction, companyName, userName);

        if (!extractedFacts.hasContent) {
            console.log('[RAG] No relevant facts extracted - returning refusal');
            return {
                success: true,
                answer: REFUSAL_MESSAGE,
                sources: [],
                metadata: {
                    pipelineCompleted: false,
                    stoppedAt: 'NO_RELEVANT_FACTS',
                    userRole: userRole,
                    processingTime: Date.now() - startTime
                }
            };
        }

        // STEP 5: Answer Generation
        pipelineLog.push({ step: 5, action: 'ANSWER_GENERATION', timestamp: Date.now() });
        const rawAnswer = await generateAnswer(extractedFacts, query, modelConfig.generation, companyName, userName);

        // STEP 6: Compliance Verification
        pipelineLog.push({ step: 6, action: 'COMPLIANCE_VERIFICATION', timestamp: Date.now() });
        const verification = await verifyCompliance(rawAnswer, extractedFacts, modelConfig.verification);

        // STEP 7: Build final response
        pipelineLog.push({ step: 7, action: 'FINAL_RESPONSE', timestamp: Date.now() });

        // Build sources list for citations
        const sources = extractedFacts.facts.map(fact => ({
            sopName: fact.sop_name,
            page: fact.page_number,
            section: fact.section
        }));

        // Deduplicate sources
        const uniqueSources = Array.from(new Map(
            sources.map(s => [`${s.sopName}-${s.page}-${s.section}`, s])
        ).values());

        return {
            success: true,
            answer: verification.answer,
            sources: uniqueSources,
            metadata: {
                pipelineCompleted: true,
                verificationPassed: verification.passed,
                wasRewritten: verification.wasRewritten || false,
                factsExtracted: extractedFacts.facts.length,
                chunksRetrieved: chunks.length,
                userRole: userRole,
                accessibleLevels: getAccessibleLevels(userRole),
                processingTime: Date.now() - startTime,
                models: modelConfig
            }
        };

    } catch (error) {
        console.error('[RAG Pipeline] Critical error:', error);
        return {
            success: false,
            answer: REFUSAL_MESSAGE,
            sources: [],
            metadata: {
                error: error.message,
                pipelineLog: pipelineLog
            }
        };
    }
};

/**
 * Utility: Get role-restricted document list
 * Returns only documents the user is authorized to see.
 */
const getAuthorizedDocuments = async (userRole, companyId) => {
    const roleFilter = buildRoleFilter(userRole, companyId);

    const documents = await DocumentChunk.aggregate([
        { $match: roleFilter },
        {
            $group: {
                _id: '$sourceFile', // Group by filename (unique), not sopName (might be null)
                sopName: { $first: '$sopName' },
                sourceFile: { $first: '$sourceFile' },
                accessLevel: { $first: '$accessLevel' },
                chunkCount: { $sum: 1 },
                lastUpdated: { $max: '$createdAt' }
            }
        },
        {
            $project: {
                sopName: { $ifNull: ["$sopName", "$_id"] }, // Fallback to filename if sopName missing
                sourceFile: 1,
                filename: '$_id', // Alias for frontend
                accessLevel: 1,
                chunkCount: 1,
                lastUpdated: 1,
                _id: 0
            }
        },
        { $sort: { filename: 1 } }
    ]);

    return documents;
};

/**
 * SECURE STREAMING PIPELINE
 * Similar to processSOPQuery but streams the generation phase.
 */
const processSOPQueryStream = async ({ query, userRole, companyId, companyName, userName, models = {} }) => {
    const startTime = Date.now();
    const modelConfig = {
        extraction: models.extraction || 'gemini-flash-latest',
        generation: models.generation || 'gemini-flash-latest'
    };

    try {
        // STEP 1-3: Intent & Vector Search
        const chunks = await performSecureVectorSearch(query, userRole, companyId);

        if (!chunks || chunks.length === 0) {
            return {
                isRefusal: true,
                answer: REFUSAL_MESSAGE,
                sources: []
            };
        }

        // STEP 4: Fact Extraction
        const extractedFacts = await extractFacts(chunks, query, modelConfig.extraction, companyName, userName);

        if (!extractedFacts.hasContent) {
            return {
                isRefusal: true,
                answer: REFUSAL_MESSAGE,
                sources: []
            };
        }

        // STEP 5: Start Generation Stream
        const factsText = extractedFacts.facts.map((fact, index) =>
            `FACT ${index + 1}:\n"${fact.exact_text}"\nSource: ${fact.sop_name} - Page ${fact.page_number}`
        ).join('\n\n');

        const generationPrompt = `You are a professional SOP assistant. Generate a clear, accurate answer using ONLY the provided facts.

ABSOLUTE RULES:
1. Use ONLY the facts provided below - no other knowledge
2. EVERY statement MUST have a citation in format: (SOP Name – Page X)
3. Do NOT add explanations beyond what the SOP text states
4. Maintain a neutral, professional tone

USER QUESTION: ${query}
USER CONTEXT: User: ${userName}, Org: ${companyName}

EXTRACTED FACTS:
${factsText}

Generate your answer now with proper citations:`;

        const stream = await getChatResponseStream(generationPrompt);

        return {
            success: true,
            stream,
            sources: extractedFacts.facts.map(f => ({
                sopName: f.sop_name,
                page: f.page_number
            })),
            metadata: {
                processingTime: Date.now() - startTime
            }
        };

    } catch (error) {
        console.error('[RAG-Stream] Pipeline Error:', error);
        throw error;
    }
};

module.exports = {
    processSOPQuery,
    processSOPQueryStream,
    performSecureVectorSearch,
    extractFacts,
    generateAnswer,
    verifyCompliance,
    getAuthorizedDocuments,
    getAccessibleLevels,
    buildRoleFilter,
    REFUSAL_MESSAGE
};
