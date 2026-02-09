/*jshint esversion: 8*/
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /register endpoint
router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB
        const db = await connectToDatabase();

        // Task 2: Access users collection
        const collection = db.collection('users');

        // Task 3: Check if email already exists
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        // Task 4: Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Task 5: Insert the new user into the database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 6: Create JWT token
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        // Task 7: Log registration success
        logger.info('User registered successfully');

        // Task 8: Return user email and token as JSON
        res.json({ email: req.body.email, authtoken });

    } catch (e) {
        logger.error('Error in registration', e);
        res.status(500).send('Internal server error');
    }
});

// POST /login endpoint

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Task 1: Connect to `secondChance` in MongoDB
        const db = await connectToDatabase();

        // Task 2: Access the `users` collection
        const collection = db.collection('users');

        // Task 3: Check for user credentials in the database
        const theUser = await collection.findOne({ email });

        // Task 7: Send appropriate message if user not found
        if (!theUser) {
            logger.error(`User not found for email: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Task 4: Check if the password matches the encrypted password
        const passwordMatch = await bcryptjs.compare(password, theUser.password);
        if (!passwordMatch) {
            logger.error(`Passwords do not match for email: ${email}`);
            return res.status(404).json({ error: 'Wrong password' });
        }

        // Task 5: Fetch user details
        const userName = `${theUser.firstName} ${theUser.lastName}`;
        const userEmail = theUser.email;

        // Task 6: Create JWT authentication
        const payload = { user: { id: theUser._id.toString() } };
        const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        logger.info(`User logged in successfully: ${email}`);

        // Send the token and user details
        res.json({ authtoken, userName, userEmail });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
