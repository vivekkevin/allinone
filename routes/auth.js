const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
    const { fullName, email, password, contactNumber } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Save user to the database
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            contactNumber,
            status: 'Pending', // Default status
        });

        await user.save();

        // Send activation email
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: user.email,
            subject: 'Activate Your Account',
            html: `<p>Thank you for registering, ${user.fullName}. Please activate your account by clicking the link below:</p>
                   <button><a href="http://localhost:${process.env.PORT}/user/activate/${user._id}">Activate Account</a></button>`,
        };

        await transport.sendMail(mailOptions);

        res.status(200).send('Registration successful! Please check your email for the activation link.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during registration. Please try again later.');
    }
});

// Activation Route
router.get('/user/activate/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.status !== 'Pending') {
            return res.status(404).send('Activation not allowed or already activated.');
        }

        // Update user status and set activation and expiry dates
        user.status = 'Activated';
        user.activationDate = new Date();
        user.expiryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
        await user.save();

        res.status(200).send('Account activated successfully! You can now log in.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during account activation. Please try again later.');
    }
});

module.exports = router;
