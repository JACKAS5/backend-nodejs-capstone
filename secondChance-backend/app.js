/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pinoLogger = require('./logger');

const connectToDatabase = require('./models/db');
const { loadData } = require("./util/import-mongo/index");

const app = express();
const port = 3060;

// Enable CORS for all routes and origins, including pre-flight requests
app.use(cors());
app.options('*', cors());

// Serve images from uploads/images folder
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB; we just do this one time
connectToDatabase().then(async (db) => {
    pinoLogger.info('Connected to DB');

    await loadData(db);
})
    .catch((e) => console.error('Failed to connect to DB', e));


app.use(express.json());

// Route files

// authRoutes Step 2: import the authRoutes and store in a constant called authRoutes
const authRoutes = require('./routes/authRoutes');

// Items API Task 1: import the secondChanceItemsRoutes and store in a constant called secondChanceItemsRoutes
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');

// Search API Task 1: import the searchRoutes and store in a constant called searchRoutes
const searchRoutes = require('./routes/searchRoutes');


const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

// Use Routes

// Serve images from the uploads/images folder
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));

// authRoutes Step 2: add the authRoutes and to the server by using the app.use() method.
app.use('/api/auth', authRoutes);

// Items API Task 2: add the secondChanceItemsRoutes to the server by using the app.use() method.
app.use('/api/secondchance/items', secondChanceItemsRoutes);

// Search API Task 2: add the searchRoutes to the server by using the app.use() method.
app.use('/api/secondchance/search', searchRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/",(req,res)=>{
    res.send("Inside the server")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
