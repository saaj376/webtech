const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  emailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Age must be a whole number.' },
  },
  // Registration must hash the password with bcryptjs before saving it.
  password: {
    type: String,
    required: true,
    select: false,
    match: [/^\$2[aby]\$(0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/, 'Password must be a bcrypt hash.'],
  },
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);
