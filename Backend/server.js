const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: "http://193.203.163.244",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Register route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log('Received registration request:', { username });
    
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Your registration logic here
    res.status(201).json({ message: `User ${username} registered successfully` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));