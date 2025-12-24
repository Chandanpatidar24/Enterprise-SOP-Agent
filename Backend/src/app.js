const express = require('express');
const cors = require('cors');

const app = express();

//Middleware
app.use(cors());  // Allow frontend to talk to backend
app.use(express.json());  // Allow us to prase JSON data/bodies

//Routes
app.get('/', (req, res) => {
    res.send(' OpsMind AI API is running.... ')
});

// Import the use Upload Router

const uploadRoutes = require('./routes/uploadRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api', uploadRoutes);     // Handles /api/upload
app.use('/api/search', searchRoutes); // Handles /api/search
app.use('/api/admin', adminRoutes);   // Handles /api/admin/documents
app.use('/api/chat', chatRoutes);     // Handles /api/chat

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

module.exports = app;

