const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    preferences: {
        dietary: [String], // e.g., ['vegetarian', 'low-carb']
        allergies: [String] // e.g., ['peanuts', 'dairy']
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;