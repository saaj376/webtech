const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/admin');
const User = require('../models/User');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch {
    console.error('User list failed.');
    return res.status(500).json({ message: 'Unable to load users. Please try again later.' });
  }
});

router.patch('/users/:emailId/role', async (req, res) => {
  const { role } = req.body || {};
  const emailId = String(req.params.emailId || '').trim().toLowerCase();

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be user or admin' });
  }

  if (emailId === req.user.emailId) {
    return res.status(403).json({ message: 'Admins cannot change their own role' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { emailId },
      { $set: { role } },
      { returnDocument: 'after', runValidators: true },
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: `Role set to ${role}.`, user });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid input details' });
    }

    console.error('User role update failed.');
    return res.status(500).json({ message: 'Unable to update user. Please try again later.' });
  }
});

module.exports = router;
