require('dotenv').config(); // Load environment variables from .env files

const app = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

