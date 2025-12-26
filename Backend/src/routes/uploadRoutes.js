const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig');
const { uploadPDF } = require('../controllers/uploadController');

// POST /api/upload - Upload a PDF file
router.post('/upload', upload.single('pdf'), uploadPDF);

module.exports = router;
