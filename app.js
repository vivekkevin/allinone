const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User');


const app = express();

// MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://vivekkevin1995:dev@techklippe.359is.mongodb.net/klippe';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Session store
const store = new MongoDBStore({
    uri: mongoURI,
    collection: 'sessions'
});

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// Routes
app.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.render('home', { username: req.session.user.username });
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.redirect('/login');
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
    res.redirect('/');
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect('/login');
    });
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
