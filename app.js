const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/loginRoutes');
const homeRoutes = require('./routes/home');
const chatRoutes = require('./routes/chatRoutes');
const salesProspectRoutes = require('./routes/salesProspectRoutes');
const forgetRoutes = require('./routes/forgetRoutes');

const app = express();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // Exit on failure
    });

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Session store
const store = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions',
});

const SECRET_KEY = process.env.SECRET_KEY;
app.use(
    session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

// Routes
app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/', chatRoutes);
app.use('/', salesProspectRoutes);
app.use('/', forgetRoutes);

app.post("/chat", (req, res) => {
    console.log("Request received:", req.body);
    res.status(201).json({ message: "Chat received successfully!" });
});

// Error handling
app.get('/error', (req, res) => {
    throw new Error('Test 500 error');
});

// Middleware for handling 404 errors
app.use((req, res, next) => {
    res.status(404).render('404');
});

// Middleware for handling 500 errors
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace for debugging
    res.status(500).render('500');
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
