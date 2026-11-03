const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/', async (req, res) => {
  const { emailId, password } = req.body || {};

  const validInput =
    typeof emailId === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId.trim()) &&
    typeof password === 'string' && password.trim().length > 0;

  if (!validInput || bcrypt.truncates(password)) {
    return res.status(400).json({ message: 'Invalid input details' });
  }

  try {
    // The schema excludes password hashes by default; login needs it for comparison.
    const user = await User.findOne({ emailId: emailId.trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User Not Registered.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid Password.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || !secret.trim() || secret.includes('<')) {
      throw new Error('JWT signing secret is not configured.');
    }

    const token = jwt.sign({ userId: user._id.toString() }, secret, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });

    return res.status(200).json({ message: 'Login Successful', token });
  } catch {
    console.error('User login failed.');
    return res.status(500).json({ message: 'Unable to log in. Please try again later.' });
  }
});

module.exports = router;
