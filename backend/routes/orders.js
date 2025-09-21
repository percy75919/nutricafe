const router = require('express').Router();
const auth = require('../middleware/auth');
let Order = require('../models/order.model');

// CREATE a new order (Protected Route with better logging)
router.route('/add').post(auth, async (req, res) => {
    console.log('--- "Add Order" route hit ---'); // Log when the route is accessed
    try {
        const { items, totalAmount } = req.body;
        const userId = req.user;

        console.log('Received order data:', { userId, items, totalAmount });

        if (!items || items.length === 0 || !totalAmount) {
            console.error('Validation Error: Order details are incomplete.');
            return res.status(400).json({ msg: 'Order details are incomplete.' });
        }

        const newOrder = new Order({
            userId,
            items,
            totalAmount
        });

        console.log('Attempting to save new order...');
        const savedOrder = await newOrder.save();
        console.log('--- Order saved successfully! ---', savedOrder);

        res.status(201).json(savedOrder);

    } catch (err) {
        // This is the most important part. It will now log the exact error.
        console.error('!!! FAILED TO SAVE ORDER !!!');
        console.error('Error Details:', err);
        res.status(500).json({ error: 'Server error while saving order.', details: err.message });
    }
});

// GET user's order history (No changes needed here)
router.route('/').get(auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;