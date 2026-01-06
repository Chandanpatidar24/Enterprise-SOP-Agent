const express = require('express');
const router = express.Router();
const { listDocuments, deleteDocument, updateDocument } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Admin Document Management (Secure)
router.get('/documents', authenticate, listDocuments);
router.delete('/documents/:filename', authenticate, deleteDocument);
router.patch('/documents/:filename', authenticate, updateDocument);

module.exports = router;
