const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

//... inside server.js

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // This is the original line for local development
app.use(express.json()); // Allows us to parse JSON

//... rest of the file

// --- Database Connection ---
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})
// Add this with your other routes in server.js
const aiRouter = require('./routes/ai');
app.use('/ai', aiRouter);

// --- API Routes ---
const menuRouter = require('./routes/menu');
const usersRouter = require('./routes/users');

app.use('/menu', menuRouter);
app.use('/users', usersRouter);
// ... inside server.js
const ordersRouter = require('./routes/orders');
app.use('/orders', ordersRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});