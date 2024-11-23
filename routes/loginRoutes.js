const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Assuming a User model exists
const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info@klippefort.com', // Your email address
        pass: 'wpfl otdd aity ewmn', // Your email password or app password
    },
});

// Render the login page
router.get('/login', (req, res) => {
    if (req.session.otpCode) {
        // If an OTP is active, render the OTP validation form
        res.render('login', { step: 2, username: req.session.tempUser.username });
    } else {
        // Otherwise, render the login form
        res.render('login', { step: 1 });
    }
});

// Handle user login (Step 1: Username & Password)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username or password.');
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password.');
        }

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000);

        // Save OTP in session and associate it with the user
        req.session.otpCode = otpCode;
        req.session.tempUser = { id: user._id, username: user.username, email: user.email };

        // Send OTP to user's email
        await transporter.sendMail({
            from: 'info@klippefort.com',
            to: user.email,
            subject: 'Your OTP Code',
            html: `<p>Your OTP code is:</p><h2>${otpCode}</h2><p>Please use this code to complete your login.</p>`,
        });

        // Render the OTP validation screen
        res.render('login', { step: 2, username }); // Render with step 2
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred. Please try again later.');
    }
});

// Handle validation code (Step 2: OTP Validation)
router.post('/validate-code', (req, res) => {
    const { code } = req.body;

    try {
        // Check if the OTP is correct
        if (!req.session.otpCode) {
            return res.status(400).send('Session expired. Please log in again.');
        }

        if (parseInt(code) !== req.session.otpCode) {
            return res.status(400).send('Invalid OTP code.');
        }

        // Log the user in
        req.session.isLoggedIn = true;
        req.session.user = req.session.tempUser;

        // Clear temporary session variables
        delete req.session.otpCode;
        delete req.session.tempUser;

        // Redirect to the home page
        res.redirect('/');
    } catch (error) {
        console.error('Error during OTP validation:', error);
        res.status(500).send('An error occurred during validation. Please try again.');
    }
});

// Render the registration page
router.get('/register', (req, res) => res.render('register'));

// Handle user registration
router.post('/register', async (req, res) => {
    const { username, password, phone, fullname, email, company, country, description } = req.body;

    try {
        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('Username or email already exists.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const user = new User({
            username,
            password: hashedPassword,
            phone,
            fullname,
            email,
            company,
            country,
            description,
            status: 'pending',
        });

        // Save the user to the database
        await user.save();

        // Notify admin for approval
        const adminEmail = 'vivekkevin1995@gmail.com'; // Admin email
        const approvalLink = `https://klippefort.online/approve-user/${user._id}`;
        await transporter.sendMail({
            from: 'info@klippefort.com',
            to: adminEmail,
            subject: 'New User Registration Approval Required',
            html: `
                <p>A new user has registered and requires approval:</p>
                <ul>
                    <li>Username: ${username}</li>
                    <li>Email: ${email}</li>
                    <li>Full Name: ${fullname}</li>
                    <li>Company: ${company}</li>
                </ul>
                <p><a href="${approvalLink}">Click here to approve the user</a>.</p>
            `,
        });

        res.send('Registration successful. Awaiting admin approval.');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('An error occurred. Please try again later.');
    }
});

// Handle user approval by admin
router.get('/approve-user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Find and update the user status to "approved"
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        user.status = 'approved';
        await user.save();

        // Notify the user about approval
        const loginLink = `https://klippefort.online/login`;
        await transporter.sendMail({
            from: 'info@klippefort.com',
            to: user.email,
            subject: 'Account Approved',
            html: `
                <p>Your account has been approved. You can now log in using the following link:</p>
                <a href="${loginLink}">Log in</a>
            `,
        });

        res.send('User approved and notified.');
    } catch (err) {
        console.error('Error during approval:', err);
        res.status(500).send('An error occurred. Please try again later.');
    }
});

// Handle user logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Logout failed. Please try again.');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login');
    });
});

module.exports = router;
