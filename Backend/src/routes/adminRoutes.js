const express = require('express');
const router = express.Router();
const { listDocuments, deleteDocument } = require('../controllers/adminController');

// Admin Document Management
router.get('/documents', listDocuments);
router.delete('/documents/:filename', deleteDocument);

module.exports = router;
