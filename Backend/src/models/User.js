const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Defines user roles and permissions for SOP access control.
 * 
 * Role Hierarchy:
 * - employee: Access to employee-level SOPs only
 * - manager: Access to employee + manager-level SOPs
 * - admin: Access to all SOPs (employee + manager + admin)
 */

const ROLE_HIERARCHY = {
    employee: 1,
    manager: 2,
    admin: 3
};

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // Never return password by default
    },
    role: {
        type: String,
        required: true,
        enum: ['employee', 'manager', 'admin'],
        default: 'employee'
    },
    department: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get accessible access levels based on user's role
UserSchema.methods.getAccessibleLevels = function () {
    const userLevel = ROLE_HIERARCHY[this.role];
    return Object.entries(ROLE_HIERARCHY)
        .filter(([_, level]) => level <= userLevel)
        .map(([role, _]) => role);
};

// Static method to get role hierarchy
UserSchema.statics.getRoleHierarchy = function () {
    return ROLE_HIERARCHY;
};

// Static method to check if a role can access a given access level
UserSchema.statics.canAccess = function (userRole, requiredLevel) {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const required = ROLE_HIERARCHY[requiredLevel] || 999;
    return userLevel >= required;
};

module.exports = mongoose.model('User', UserSchema);
module.exports.ROLE_HIERARCHY = ROLE_HIERARCHY;
