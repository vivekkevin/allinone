const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Activated'], default: 'Pending' },
    activationDate: { type: Date },
    expiryDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
