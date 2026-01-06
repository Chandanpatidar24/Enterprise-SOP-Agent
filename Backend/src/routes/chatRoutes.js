const express = require('express');
const router = express.Router();
const { askAI, getSessions, getSession, deleteSession } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// Chat route (Protected)
router.post('/', authenticate, askAI);

// Session history routes (Protected)
router.get('/sessions', authenticate, getSessions);
router.get('/sessions/:id', authenticate, getSession);
router.delete('/sessions/:id', authenticate, deleteSession);

module.exports = router;

