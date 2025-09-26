const router = require('express').Router();
const auth = require('../middleware/auth');
const MenuItem = require('../models/menuItem.model');
const User = require('../models/user.model');
const OpenAI = require('openai');

// Initialize OpenAI client to point to OpenRouter
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Or your deployed site
        "X-Title": "NutriCafe", 
    },
});

router.route('/chat').post(auth, async (req, res) => {
    try {
        const userQuery = req.body.message;
        const user = await User.findById(req.user);
        const menuItems = await MenuItem.find();

        const systemMessage = `You are a friendly nutritionist agent for NutriCafé. Your rules: - Your tone is conversational. - Do NOT repeat suggestions. - NEVER start your response with instruction tags like "[INST]". Respond like a human. - If you suggest a specific item, you MUST include its exact "_id" in your response in the format [ITEM_ID: "the_id_here"]. User's preferences: Dietary needs are ${user.preferences.dietary.join(', ') || 'none'} and allergies are ${user.preferences.allergies.join(', ') || 'none'}. The full menu is: ${JSON.stringify(menuItems)}.`;

        const completion = await openai.chat.completions.create({
            model: "mistralai/mistral-7b-instruct",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userQuery }
            ],
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply: reply });

    } catch (error) {
        console.error("AI agent error:", error);
        res.status(500).json({ error: "The AI agent is currently unavailable." });
    }
});

module.exports = router;