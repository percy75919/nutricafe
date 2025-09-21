const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON

// --- Database Connection ---
const uri = process.env.ATLAS_URI; // We will set this up later
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

// --- API Routes (We'll create these files next) ---
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