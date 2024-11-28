const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.render('dashboard/sales/home', { 
            username: req.session.user.username, 
            company: req.session.user.company 
        });
    } else {
        res.redirect('/login');
    }
});



module.exports = router;
