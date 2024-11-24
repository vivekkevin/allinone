const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
        enum: ['user', 'support'] // restrict sender types
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    platform: {
        type: String,
        default: 'WhatsApp'
    },
    messages: [messageSchema]
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Chat', chatSchema);