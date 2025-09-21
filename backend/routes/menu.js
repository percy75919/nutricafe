const router = require('express').Router();
let MenuItem = require('../models/menuItem.model');
let User = require('../models/user.model');
const auth = require('../middleware/auth'); // Import the middleware

// GET all menu items
router.route('/').get((req, res) => {
    MenuItem.find()
        .then(items => {
            // ADD THESE LINES TO DEBUG
            console.log('--- DATA BEING SENT FROM SERVER ---');
            console.log(JSON.stringify(items, null, 2));
            console.log('--- END OF DATA ---');

            res.json(items); // This line sends the data
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// GET RECOMMENDED menu items (New Smarter Logic)
router.route('/recommended').get(auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('preferences'); // Only get preferences
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        const dietaryPrefs = user.preferences.dietary || [];
        const allergies = user.preferences.allergies || [];

        // Build the query
        let query = {};
        
        // If user has dietary preferences, find items that match them
        if (dietaryPrefs.length > 0) {
            query.tags = { $in: dietaryPrefs };
        }

        // AND if user has allergies, exclude items that have those tags
        if (allergies.length > 0) {
            // Add the $nin (not in) condition to the tags query
            query.tags = { ...query.tags, $nin: allergies };
        }

        // If user has no preferences or allergies, query is empty, returns all items
        const recommendedItems = await MenuItem.find(query);
        res.json(recommendedItems);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ADD a new menu item (for admin)
// ADD a new menu item (for admin)
router.route('/add').post((req, res) => {
    // Destructure all fields, including the nested nutrition object
    const { name, description, category, price, imageUrl, nutrition, tags } = req.body;

    // --- THIS IS THE FIX ---
    // Make sure the nutrition object is properly structured before saving
    const newMenuItem = new MenuItem({
        name,
        description,
        category,
        price,
        imageUrl,
        tags,
        nutrition: {
            calories: nutrition ? nutrition.calories : null,
            protein: nutrition ? nutrition.protein : null,
            carbs: nutrition ? nutrition.carbs : null,
            fat: nutrition ? nutrition.fat : null
        }
    });
    // --- END OF FIX ---

    newMenuItem.save()
        .then(() => res.status(201).json('Menu item added!'))
        .catch(err => {
            console.error("Error saving menu item:", err);
            res.status(400).json('Error: ' + err);
        });
});

module.exports = router;