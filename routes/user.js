const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const router = express.Router();

// Render the login page
router.get('/login', (req, res) => {
    res.render('login', { step: 1 }); // Pass step 1 for the initial login page
});


// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email provider
    auth: {
        user: 'info@klippefort.com', // Replace with your email
        pass: 'wpfl otdd aity ewmn', // Replace with your email password or app password
    },
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
            return res.status(400).send('Username or Email already exists.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user with "pending" status
        const user = new User({
            username,
            password: hashedPassword,
            phone: phone || null,
            fullname,
            email,
            company,
            country,
            description: description || '',
            status: 'pending', // New field to track approval status
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Send an email to the administrator for approval
        const adminEmail = 'vivekkevin1995@gmail.com'; // Replace with admin email
        const approvalLink = `https://klippefort.online/approve-user/${savedUser._id}`;
        await transporter.sendMail({
            from: 'info@klippefort.com', // Replace with your email
            to: adminEmail,
            subject: 'New User Registration Approval Required',
            html: `
            <div style="font-family: Arial, sans-serif; background: #F7F7F7; padding: 20px; color: #333;">
                <table style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);">
                    <thead>
                        <tr>
                            <th style="background: linear-gradient(to right, #F78DCD, #E9B1C8, #FDDEB5); padding: 20px; text-align: center;">
                                <img src="https://klippefort.online/img/logo.png" alt="Logo" style="height: 50px;">
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 20px;">
                                <h1 style="font-size: 24px; margin-bottom: 10px; text-align: center; color: #444;">New User Registration</h1>
                                <p style="font-size: 16px; line-height: 1.5; text-align: center; margin: 10px 0;">
                                    A new user has registered and requires your approval:
                                </p>
                                <table style="width: 100%; margin: 20px 0; font-size: 16px; color: #555;">
                                    <tr>
                                        <td style="font-weight: bold;">Username:</td>
                                        <td>${username}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: bold;">Email:</td>
                                        <td>${email}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: bold;">Full Name:</td>
                                        <td>${fullname}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: bold;">Company:</td>
                                        <td>${company}</td>
                                    </tr>
                                </table>
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="${approvalLink}" style="
                                        background: linear-gradient(to right, #F78DCD, #E9B1C8, #FDDEB5);
                                        color: white;
                                        padding: 12px 24px;
                                        text-decoration: none;
                                        font-size: 16px;
                                        border-radius: 8px;
                                        display: inline-block;
                                        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                                    ">Approve User</a>
                                </div>
                                <p style="font-size: 14px; color: #777; text-align: center;">
                                    If you believe this registration is invalid, please ignore this email.
                                </p>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="text-align: center; padding: 20px; font-size: 12px; color: #999; background: #F7F7F7;">
                                <p>© 2024 Klippefort-Digital. All rights reserved.</p>
                                <p><a href="https://klippefort.com" style="color: #F78DCD; text-decoration: none;">Visit our website</a></p>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `,        
        });

        res.send('Registration successful. Awaiting admin approval.');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Registration failed. Please try again later.');
    }
});

// Handle user approval by admin
router.get('/approve-user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Find and update the user to "approved" status
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        user.status = 'approved';
        await user.save();

        // Send a verification email to the user
        const loginLink = `https://klippefort.online/login`;
        await transporter.sendMail({
            from: 'info@klippefort.com', // Replace with your email
            to: user.email,
            subject: 'Your Account is Approved',
            html: `
            <div style="font-family: Arial, sans-serif; background: #F7F7F7; padding: 20px; color: #333;">
                <table style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);">
                    <thead>
                        <tr>
                            <th style="background: linear-gradient(to right, #F78DCD, #E9B1C8, #FDDEB5); padding: 20px; text-align: center;">
                                <img src="https://klippefort.online/img/logo.png" alt="Logo" style="height: 50px;">
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 20px;">
                                <h1 style="font-size: 24px; margin-bottom: 10px; text-align: center; color: #444;">Your Account is Approved!</h1>
                                <p style="font-size: 16px; line-height: 1.5; text-align: center; margin: 10px 0;">
                                    Dear User,
                                </p>
                                <p style="font-size: 16px; line-height: 1.5; text-align: center; margin: 10px 0;">
                                    Your account has been approved by the administrator. You can now log in using the link below:
                                </p>
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="${loginLink}" style="
                                        background: linear-gradient(to right, #F78DCD, #E9B1C8, #FDDEB5);
                                        color: white;
                                        padding: 12px 24px;
                                        text-decoration: none;
                                        font-size: 16px;
                                        border-radius: 8px;
                                        display: inline-block;
                                        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                                    ">Log in to your account</a>
                                </div>
                                <p style="font-size: 14px; color: #777; text-align: center;">
                                    If you did not request this, please contact support.
                                </p>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="text-align: center; padding: 20px; font-size: 12px; color: #999; background: #F7F7F7;">
                                <p>© 2024 Klippefort-Digital. All rights reserved.</p>
                                <p><a href="https://klippefort.com" style="color: #F78DCD; text-decoration: none;">Visit our website</a></p>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `,        
        });

        res.send('User approved and login link sent.');
    } catch (err) {
        console.error('Error during approval:', err);
        res.status(500).render('error');
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

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password.');
        }

        // Generate 6-digit validation code
        const validationCode = Math.floor(100000 + Math.random() * 900000);

        // Save the code temporarily in the session
        req.session.validationCode = validationCode;
        req.session.tempUser = { id: user._id, username: user.username };

        // Send validation code to user's email
        await transporter.sendMail({
            from: 'info@klippefort.com',
            to: user.email,
            subject: 'Your Login Validation Code',
            html: `
                <p>Your login validation code is:</p>
                <h2>${validationCode}</h2>
                <p>Please use this code to complete your login.</p>
            `,
        });

        // Render validation page
        res.render('login', { step: 2, username });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Login failed. Please try again later.');
    }
});

// Handle validation code (Step 2: Validation Code)
router.post('/validate-code', (req, res) => {
    const { code } = req.body;

    try {
        // Check if the code matches
        if (parseInt(code) !== req.session.validationCode) {
            return res.status(400).send('Invalid validation code.');
        }

        // Log the user in
        req.session.isLoggedIn = true;
        req.session.user = req.session.tempUser;

        // Clear temporary session variables
        delete req.session.validationCode;
        delete req.session.tempUser;

        // Redirect to the home page
        res.redirect('/');
    } catch (err) {
        console.error('Error during validation:', err);
        res.status(500).send('Validation failed. Please try again later.');
    }
});

// Handle user logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Logout failed. Please try again later.');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login');
    });
});

module.exports = router;
