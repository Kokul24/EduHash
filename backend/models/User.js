const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed with bcrypt
  role: { type: String, enum: ['admin', 'student', 'auditor'], default: 'student' },
  studentId: { type: String } // Optional, for students
});

module.exports = mongoose.model('User', UserSchema);
