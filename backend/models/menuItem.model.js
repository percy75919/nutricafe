const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Snacks', 'Beverage','Appetizer','Main Course'] },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    nutrition: {
        calories: { type: Number },
        protein: { type: Number }, // in grams
        carbs: { type: Number },   // in grams
        fat: { type: Number }      // in grams
    },
    tags: [String] // e.g., ['vegan', 'gluten-free', 'high-protein']
}, {
    timestamps: true,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;