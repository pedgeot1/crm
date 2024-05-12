// User Authentication using Passport.js
// Implement signup, login, logout, and token generation

// MongoDB setup
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/crm_app', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Authentication with Passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// JWT token generation
function generateToken(user) {
    return jwt.sign({ username: user.username, id: user._id }, 'your-secret-key', { expiresIn: '1h' });
}

// Routes for authentication
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    const token = generateToken(req.user);
    res.json({ token });
});

// Define Contact schema
const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    company: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Contact = mongoose.model('Contact', contactSchema);

// Routes for contact management
app.post('/contacts', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, company } = req.body;
        const contact = new Contact({
            firstName,
            lastName,
            email,
            phone,
            company,
            createdBy: req.user._id
        });
        await contact.save();
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find({ createdBy: req.user._id });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User authentication actions (actions/auth.js)
import axios from 'axios';

export const login = (username, password) => async dispatch => {
    try {
        const res = await axios.post('/login', { username, password });
        localStorage.setItem('token', res.data.token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.token });
    } catch (error) {
        dispatch({ type: 'LOGIN_FAIL', payload: error.response.data.message });
    }
};

// User authentication reducer (reducers/auth.js)
const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    error: null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                token: action.payload,
                isAuthenticated: true,
                error: null
            };
        case 'LOGIN_FAIL':
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                error: action.payload
            };
        default:
            return state;
    }
};

export default authReducer;

