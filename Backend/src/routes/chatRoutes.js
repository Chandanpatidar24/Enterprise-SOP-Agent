const express = require('express');
const router = express.Router();
const { askAI, getSessions, getSession, deleteSession } = require('../controllers/chatController');

// Chat route
router.post('/', askAI);

// Session history routes
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);
router.delete('/sessions/:id', deleteSession);

module.exports = router;

