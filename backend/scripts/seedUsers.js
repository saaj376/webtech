const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const users = [
  { username: 'Admin User', emailId: 'admin@store.com', age: 30, password: 'admin123', role: 'admin' },
  { username: 'Raghavendra', emailId: 'user@store.com', age: 21, password: 'secret1', role: 'user' },
];

async function seedUsers() {
  try {
    await connectDB();
    await User.init();

    // Existing accounts created before roles were added become regular users.
    await User.updateMany({ role: { $exists: false } }, { $set: { role: 'user' } });

    for (const user of users) {
      const password = await bcrypt.hash(user.password, 10);

      await User.updateOne(
        { emailId: user.emailId },
        {
          $setOnInsert: {
            username: user.username,
            emailId: user.emailId,
            age: user.age,
            password,
          },
          $set: { role: user.role },
        },
        { upsert: true, runValidators: true },
      );
    }

    console.log('Demo users are ready:');
    console.log('  Admin: admin@store.com / admin123');
    console.log('  User:  user@store.com / secret1');
  } catch {
    console.error('User seed failed. Check MongoDB connectivity, permissions, and user indexes.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedUsers();
