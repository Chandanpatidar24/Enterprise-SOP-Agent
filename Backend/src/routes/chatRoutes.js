const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/chatController');

// Chat route
router.post('/', askAI);

module.exports = router;
