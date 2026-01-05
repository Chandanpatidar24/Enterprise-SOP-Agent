const express = require('express');
const router = express.Router();
const { listDocuments, deleteDocument, updateDocument } = require('../controllers/adminController');

// Admin Document Management
router.get('/documents', listDocuments);
router.delete('/documents/:filename', deleteDocument);
router.patch('/documents/:filename', updateDocument);

module.exports = router;
