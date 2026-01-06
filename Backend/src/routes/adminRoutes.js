const express = require('express');
const router = express.Router();
const { listDocuments, deleteDocument, updateDocument, listUsers, updateUserRole, createUser, updateUserOrgType, deleteUser } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Admin User Management
router.get('/users', authenticate, listUsers);
router.post('/users', authenticate, createUser);
router.patch('/users/:userId', authenticate, updateUserRole);
router.patch('/users/:userId/org-type', authenticate, updateUserOrgType);
router.delete('/users/:userId', authenticate, deleteUser);

// Admin Document Management (Secure)
router.get('/documents', authenticate, listDocuments);
router.delete('/documents/:filename', authenticate, deleteDocument);
router.patch('/documents/:filename', authenticate, updateDocument);

module.exports = router;
