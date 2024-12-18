const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null }, // Optional field
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, default: '' }, // Optional field
    resetPasswordToken: { type: String, default: null }, // Token for password reset
    resetPasswordExpires: { type: Date, default: null }, // Token expiry timestamp
});

module.exports = mongoose.model('User', UserSchema);
