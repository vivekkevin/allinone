const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null }, // Optional field
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, default: '' } // Optional field
});

module.exports = mongoose.model('User', UserSchema);
