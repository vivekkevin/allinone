const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // 'user' or 'support'
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    platform: { type: String, required: true },
    messages: [messageSchema],
});

module.exports = mongoose.model("Chat", chatSchema);
