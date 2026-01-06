const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig');
const { uploadPDF } = require('../controllers/uploadController');

const { authenticate } = require('../middleware/auth');

// POST /api/upload - Upload a PDF file (Protected)
router.post('/', authenticate, upload.single('pdf'), uploadPDF);

module.exports = router;
