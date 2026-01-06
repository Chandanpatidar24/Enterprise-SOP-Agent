const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'undefined'}`);
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error : ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;