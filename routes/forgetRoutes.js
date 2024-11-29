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

// Render forget password page
router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', { message: null }); // Pass a default value for `message`
});

// Handle forgot password form submission
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).render('auth/forgot-password', { message: 'No account found with this email address.' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = await bcrypt.hash(resetToken, 12);

        // Save reset token hash and expiry to user
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        // Send password reset email
        const resetLink = `https://klippefort.online/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: 'info@klippefort.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });

        res.render('auth/forgot-password', { message: 'Password reset email sent! Please check your inbox.' });
    } catch (error) {
        res.status(500).render('auth/forgot-password', { message: 'An error occurred. Please try again later.' });
    }
});


// Render reset password page
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Attempt to find the user with a valid reset token and expiry
        const user = await User.findOne({
            resetPasswordExpires: { $gt: Date.now() }, // Ensure token has not expired
        });


        if (!user) {
            return res.status(400).render('auth/reset-password', { token: null, message: 'Invalid or expired password reset token.' });
        }

        // Compare the plain token with the hashed token
        const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);

        if (!isValidToken) {
            return res.status(400).render('auth/reset-password', { token: null, message: 'Invalid or expired password reset token.' });
        }

        res.render('auth/reset-password', { token, message: null });
    } catch (error) {
        console.error('Error during password reset page rendering:', error);
        res.status(500).render('auth/reset-password', { token: null, message: 'An error occurred. Please try again later.' });
    }
});

// Handle password reset form submission
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params; // This is the resetToken passed via URL
    const { password } = req.body;

    try {
        // Find user with matching reset token and valid expiry
        const user = await User.findOne({
            resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
        });

        if (!user || !(await bcrypt.compare(token, user.resetPasswordToken))) {
            return res.status(400).render('auth/reset-password', { token: null, message: 'Invalid or expired password reset token.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.render('/login', { token: null, message: 'Password reset successful! You can now log in with your new password.' });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).render('auth/reset-password', { token: null, message: 'An error occurred. Please try again later.' });
    }
});


module.exports = router;
