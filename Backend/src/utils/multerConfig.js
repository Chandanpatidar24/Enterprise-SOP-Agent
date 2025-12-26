const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Using 'uploads/' ensures multer creates the directory for us
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename 
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

module.exports = upload;
