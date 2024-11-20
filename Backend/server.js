const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({
    origin: "http://193.203.163.244", // Allow requests from your frontend
    methods: "GET,POST,PUT,DELETE",
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

// Routes
app.use('/api/auth', authRoutes); // Ensure auth routes are properly scoped

// Define the Register Route (Example)
app.post("/api/register", (req, res) => {
    const { username, password } = req.body;

    // Replace this with actual user creation logic
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Example response
    res.status(201).json({ message: `User ${username} registered successfully` });
});

// Define a Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint works!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
