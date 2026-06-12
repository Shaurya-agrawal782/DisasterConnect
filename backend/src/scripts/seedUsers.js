const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('../config/env');

const seedUsers = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Database connected.');

    // Define seed users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@disasterconnect.dev',
        password: 'Admin@12345',
        role: 'admin',
        isActive: true
      },
      {
        name: 'Responder User',
        email: 'responder@disasterconnect.dev',
        password: 'Responder@12345',
        role: 'responder',
        isActive: true
      },
      {
        name: 'Citizen User',
        email: 'citizen@disasterconnect.dev',
        password: 'Citizen@12345',
        role: 'citizen',
        isActive: true
      }
    ];

    // Seed each user
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        // Create user (triggers pre-save bcrypt hook)
        await User.create(userData);
        console.log(`Seeded account: ${userData.email}`);
      } else {
        // Update user if already exists to ensure active state
        existingUser.name = userData.name;
        existingUser.role = userData.role;
        existingUser.isActive = true;
        // Optional: Re-hash and save default password if needed
        existingUser.password = userData.password;
        await existingUser.save();
        console.log(`User already exists, updated/verified: ${userData.email}`);
      }
    }

    console.log('User seeding completed successfully!');
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Execute seeding script
seedUsers();
