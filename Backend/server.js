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
app.use('/', authRoutes);

// Define additional routes
app.post("/register", (req, res) => {
    res.json({ message: "User registered successfully" });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint works!' });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
