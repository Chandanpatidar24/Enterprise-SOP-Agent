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
const sopRoutes = require('./routes/sopRoutes'); // Secure SOP with role-based access
const authRoutes = require('./routes/authRoutes'); // Authentication routes

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);     // Protected
app.use('/api/search', searchRoutes); // Handles /api/search
app.use('/api/admin', adminRoutes);   // Handles /api/admin/documents
app.use('/api/chat', chatRoutes);     // Handles /api/chat (legacy)
app.use('/api/sop', sopRoutes);       // Handles /api/sop/* (secure role-based endpoints)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

module.exports = app;

