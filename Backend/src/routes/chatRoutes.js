const express = require('express');
const router = express.Router();
const { askAI, getHistory, getSession, deleteSession } = require('../controllers/chatController');

// Chat route
router.post('/', askAI);

// History routes
router.get('/history', getHistory);
router.get('/history/:id', getSession);
router.delete('/history/:id', deleteSession);

module.exports = router;

