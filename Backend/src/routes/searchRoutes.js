const express = require('express');
const router = express.Router();
const { searchChunks } = require('../controllers/searchController');

// Search route
router.post('/', searchChunks);

module.exports = router;
