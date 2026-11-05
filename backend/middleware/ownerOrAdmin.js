const User = require('../models/User');

async function ownerOrAdmin(req, res, next) {
  const { emailId } = req.query;

  if (typeof emailId !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId.trim())) {
    return res.status(400).json({ message: 'Invalid input details' });
  }

  try {
    const user = await User.findOne({ emailId: emailId.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSelf = user._id.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'You can only manage your own profile' });
    }

    // An admin cannot modify another admin's account.
    if (isAdmin && !isSelf && user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot modify other admins' });
    }

    req.targetEmailId = user.emailId;
    req.profileFilter = { _id: user._id, emailId: user.emailId };
    req.profile = user;
  } catch {
    console.error('User profile lookup failed.');
    return res.status(500).json({ message: 'Unable to manage user profile. Please try again later.' });
  }

  return next();
}

module.exports = ownerOrAdmin;
