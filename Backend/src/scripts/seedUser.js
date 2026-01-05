/**
 * Seed User Script
 * 
 * Creates an initial admin user for the system.
 * Usage: node src/scripts/seedUser.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@opsmind.com';
        const adminPassword = 'admin123'; // CHANGE THIS IN PRODUCTION

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');

            // Optional: Update role to ensure it's admin
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('Updated existing user to Admin role.');
            }
        } else {
            // Create new admin
            const newAdmin = await User.create({
                username: 'admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                department: 'IT Security',
                isActive: true
            });

            console.log('Created new Admin user:');
            console.log(`Email: ${newAdmin.email}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();
