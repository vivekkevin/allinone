const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.render('home', { username: req.session.user.username });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
