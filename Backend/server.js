const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();

// Updated CORS configuration
app.use(cors({
    origin: ["http://193.203.163.244", "http://localhost:3000"], // Allow both production and development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(express.json());

// Database Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

// Updated register route to match frontend URL pattern
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    res.status(201).json({ message: `User ${username} registered successfully` });
});

// Routes
app.use('/auth', authRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint works!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));