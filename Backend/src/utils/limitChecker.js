const User = require('../models/User');
const DocumentChunk = require('../models/DocumentChunk');
const Organization = require('../models/Organization');
const sopConfig = require('../config/sopConfig');

/**
 * Check if an organization has reached its user limit.
 * @param {string} companyId 
 * @returns {Promise<{allowed: boolean, limit: number, current: number}>}
 */
const checkUserLimit = async (companyId) => {
    if (!companyId) return { allowed: true };

    const org = await Organization.findById(companyId);
    if (!org) return { allowed: true };

    const plan = org.plan || 'free';
    const limit = sopConfig.planLimits[plan]?.maxUsers || 3;

    if (limit === Infinity) return { allowed: true, limit, current: 0 };

    const current = await User.countDocuments({ companyId });

    return {
        allowed: current < limit,
        limit,
        current
    };
};

/**
 * Check if an organization has reached its document limit.
 * @param {string} companyId 
 * @param {string} newFilename - Optional, if checking for a specific new file
 * @returns {Promise<{allowed: boolean, limit: number, current: number}>}
 */
const checkDocumentLimit = async (companyId, newFilename = null) => {
    if (!companyId) return { allowed: true };

    const org = await Organization.findById(companyId);
    if (!org) return { allowed: true };

    const plan = org.plan || 'free';
    const limit = sopConfig.planLimits[plan]?.maxDocuments || 3;

    if (limit === Infinity) return { allowed: true, limit, current: 0 };

    const docs = await DocumentChunk.distinct('sourceFile', { companyId });
    const current = docs.length;

    // If we're updating an existing file, it's always allowed
    if (newFilename && docs.includes(newFilename)) {
        return { allowed: true, limit, current };
    }

    return {
        allowed: current < limit,
        limit,
        current
    };
};

module.exports = {
    checkUserLimit,
    checkDocumentLimit
};
