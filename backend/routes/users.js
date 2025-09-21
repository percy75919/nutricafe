const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let User = require('../models/user.model');

// REGISTER a new user (This route is from before, no changes needed)
router.route('/register').post(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ msg: "Please enter all fields." });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ msg: "An account with this email already exists." });
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: passwordHash,
        });

        const savedUser = await newUser.save();
        res.json(savedUser);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN user (This is the new, complete logic)
router.route('/login').post(async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ msg: "Please enter all fields." });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "No account with this email has been registered." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials." });
        }

        // Create a token with a 1-hour expiration
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token will expire in 1 hour
        );

        // Send token and user info back
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
            },
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;