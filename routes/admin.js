const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Approve User
router.get('/admin/approve/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');

    user.status = 'Approved';
    await user.save();

    // Send email to user
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
        subject: 'Account Approved',
        html: `<p>Your account has been approved. Please activate your account by clicking the link below:</p>
               <button><a href="https://klippefort.online:${process.env.PORT}/user/activate/${user._id}">Activate Account</a></button>`,
    };

    await transport.sendMail(mailOptions);

    res.send('User approved and notified.');
});

// Activate User
router.get('/user/activate/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.status !== 'Approved') return res.status(404).send('Activation not allowed');

    user.status = 'Activated';
    user.activationDate = new Date();
    user.expiryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
    await user.save();

    res.send('Account activated. You can now log in.');
});

module.exports = router;
