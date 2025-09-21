const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        
        // Log to see if the token is even arriving at the backend
        console.log('Received token on backend:', token);

        if (!token) {
            return res.status(401).json({ msg: "No authentication token, authorization denied." });
        }

        // The jwt.verify function will throw an error if the token is invalid or expired
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = verified.id; // Add user id from payload to the request
        next(); // Move on to the next function

    } catch (err) {
        // Log the specific error to the terminal
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ msg: "Token is not valid.", error: err.message });
    }
};

module.exports = auth;