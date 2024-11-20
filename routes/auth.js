const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Render the login page
router.get('/login', (req, res) => res.render('login'));

// Render the registration page
router.get('/register', (req, res) => res.render('register'));

// Handle user registration
router.post('/register', async (req, res) => {
    const { username, password, phone, fullname, email, company, country, description } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const user = new User({
            username,
            password: hashedPassword,
            phone: phone || null, // Handle optional field
            fullname,
            email,
            company,
            country,
            description: description || '', // Handle optional field
        });

        // Save the user to the database
        await user.save();

        // Redirect to login page after successful registration
        res.redirect('/login');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Registration failed. Please try again later.');
    }
});

// Handle user login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.redirect('/login');
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/login');
        }

        // Set session and redirect to home page
        req.session.isLoggedIn = true;
        req.session.user = user;
        res.redirect('/');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Login failed. Please try again later.');
    }
});

// Handle user logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Logout failed. Please try again later.');
        }
        res.redirect('/login');
    });
});

module.exports = router;
