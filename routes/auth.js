const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
        username,
        email,
        password: hashedPassword,
    });

    await user.save();

    // Send email to admin
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: 'New User Registration Request',
        html: `<p>A new user has registered with the following details:</p>
               <p>Username: ${username}</p>
               <p>Email: ${email}</p>
               <button><a href="https://klippefort.online:${process.env.PORT}/admin/approve/${user._id}">Approve Registration</a></button>`,
    };

    await transport.sendMail(mailOptions);

    res.send('Registration complete. Await admin approval.');
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }

    if (user.status !== 'Activated') {
        return res.status(403).send('Account not activated');
    }

    const now = new Date();
    if (now > user.expiryDate) {
        return res.status(403).send('Account expired. Please contact the administrator.');
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    res.redirect('/');
});

module.exports = router;
