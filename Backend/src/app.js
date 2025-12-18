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
app.use('/api', uploadRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

module.exports = app;

