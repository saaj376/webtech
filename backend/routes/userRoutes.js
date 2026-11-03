const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, emailId, age, password } = req.body || {};

  const validInput =
    typeof username === 'string' && username.trim().length > 0 &&
    typeof emailId === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId.trim()) &&
    typeof age === 'number' && Number.isSafeInteger(age) && age > 0 &&
    typeof password === 'string' && password.trim().length > 0;

  // bcrypt only uses the first 72 UTF-8 bytes; reject truncation instead.
  if (!validInput || bcrypt.truncates(password)) {
    return res.status(400).json({ message: 'Invalid input details' });
  }

  const normalizedEmail = emailId.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ emailId: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username.trim(),
      emailId: normalizedEmail,
      age,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      message: `Successfully registered! Welcome, ${user.username}.`,
    });
  } catch (error) {
    // The unique index also protects against simultaneous registrations.
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid input details' });
    }

    console.error('User registration failed.');
    return res.status(500).json({ message: 'Unable to register user. Please try again later.' });
  }
});

module.exports = router;
