const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

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

function handleProfileError(error, res) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid input details' });
  }

  console.error('User profile operation failed.');
  return res.status(500).json({ message: 'Unable to manage user profile. Please try again later.' });
}

async function loadOwnProfile(req, res, next) {
  const { emailId } = req.query;
  if (typeof emailId !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId.trim())) {
    return res.status(400).json({ message: 'Invalid input details' });
  }

  try {
    const user = await User.findOne({ emailId: emailId.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only manage your own profile' });
    }

    req.profileFilter = { _id: user._id, emailId: user.emailId };
    req.profile = user;
  } catch (error) {
    return handleProfileError(error, res);
  }

  return next();
}

// Profile viewing reuses the same authentication and ownership checks as updates.
router.get('/', authMiddleware, loadOwnProfile, (req, res) => {
  const { username, emailId, age } = req.profile;
  return res.status(200).json({ username, emailId, age });
});

function updateProfile(requireAllFields) {
  return async (req, res) => {
    const body = req.body;
    const editableFields = ['username', 'age', 'password'];

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ message: 'Invalid input details' });
    }

    const fields = Object.keys(body);
    if (fields.length === 0 || fields.some(field => !editableFields.includes(field)) ||
        (requireAllFields && editableFields.some(field => !Object.hasOwn(body, field)))) {
      return res.status(400).json({ message: 'Invalid input details' });
    }

    if ((Object.hasOwn(body, 'username') &&
         (typeof body.username !== 'string' || !body.username.trim())) ||
        (Object.hasOwn(body, 'age') &&
         (typeof body.age !== 'number' || !Number.isSafeInteger(body.age) || body.age <= 0)) ||
        (Object.hasOwn(body, 'password') &&
         (typeof body.password !== 'string' || !body.password.trim() || bcrypt.truncates(body.password)))) {
      return res.status(400).json({ message: 'Invalid input details' });
    }

    try {
      const updates = {};
      if (Object.hasOwn(body, 'username')) updates.username = body.username.trim();
      if (Object.hasOwn(body, 'age')) updates.age = body.age;
      if (Object.hasOwn(body, 'password')) updates.password = await bcrypt.hash(body.password, 10);

      const user = await User.findOneAndUpdate(req.profileFilter, { $set: updates }, {
        returnDocument: 'after',
        runValidators: true,
        upsert: false,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        message: requireAllFields
          ? 'User details updated successfully'
          : 'Selected details updated successfully',
      });
    } catch (error) {
      return handleProfileError(error, res);
    }
  };
}

router.put('/', authMiddleware, loadOwnProfile, updateProfile(true));
router.patch('/', authMiddleware, loadOwnProfile, updateProfile(false));

router.delete('/', authMiddleware, loadOwnProfile, async (req, res) => {
  try {
    const user = await User.findOneAndDelete(req.profileFilter);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return handleProfileError(error, res);
  }
});

module.exports = router;
