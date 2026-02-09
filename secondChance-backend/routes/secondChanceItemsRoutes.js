/*jshint esversion: 8 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const pino = require('pino');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Define the upload directory path
const directoryPath = path.join(__dirname, '../public/images');

// Make sure the directory exists
if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    logger.info(`Created folder: ${directoryPath}`);
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        // 1 Connect to database
        const db = await connectToDatabase();

        // 2 Get collection
        const collection = db.collection("secondChanceItems");

        // 3 Fetch all documents
        const secondChanceItems = await collection.find({}).toArray();

        // 4 Return as JSON
        logger.info(`Fetched ${secondChanceItems.length} items`);
        res.json(secondChanceItems);

    } catch (error) {
        logger.error({ error }, 'oops something went wrong');
        next(error);
    }
});

// Add a new item
router.post('/', upload.single('image'), async(req, res,next) => {
    try {
        // 1 Connect to database
        const db = await connectToDatabase();

        // 2 Get collection
        const collection = db.collection('secondChanceItems');

        // 3 Create new item from request body
        let newItem = { ...req.body };

        // 4 Generate new id
        const lastItem = await collection
            .find({})
            .sort({ id: -1 })
            .limit(1)
            .toArray();
        const lastId = lastItem.length > 0 ? parseInt(lastItem[0].id) : 0;
        newItem.id = (lastId + 1).toString();

        // 5 Add timestamp
        newItem.date_added = Math.floor(Date.now() / 1000);

        // 6 Handle image upload
        if (req.file) {
            newItem.image = `/images/${req.file.originalname}`;
            logger.info(`Uploaded image: ${req.file.originalname}`);
        } else {
            newItem.image = null; // Optional placeholder if no file uploaded
        }

        // 7 Insert into database
        const result = await collection.insertOne(newItem);
        newItem._id = result.insertedId;

        // 8 Return new item
        res.status(201).json(newItem);

    } catch (e) {
        logger.error({ e }, 'Error adding new item');
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        // 1️ Connect to database
        const db = await connectToDatabase();

        // 2️ Get collection
        const collection = db.collection('secondChanceItems');

        // 3️ Get id from request params
        const id = req.params.id;

        // 4️ Find item by id
        const secondChanceItem = await collection.findOne({ id: id });

        // 5️ If not found, return 404
        if (!secondChanceItem) {
            logger.warn({ id }, 'secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // 6️ Return item
        logger.info({ secondChanceItem }, 'Item fetched successfully');
        res.json(secondChanceItem);

    } catch (error) {
        logger.error({ error }, 'Error fetching secondChanceItem');
        next(error);
    }
});

// Update an existing item
router.put('/:id', async(req, res,next) => {
    const id = req.params.id;
    try {
        // 1️ Connect to database
        const db = await connectToDatabase();

        // 2️ Get collection
        const collection = db.collection('secondChanceItems');

        // 3️ Check if item exists
        const existingItem = await collection.findOne({ id: id });

        if (!existingItem) {
            logger.warn({ id }, 'secondChanceItem not found for update');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // 4️ Prepare updated fields
        const updatedFields = {
            category: req.body.category,
            condition: req.body.condition,
            age_days: req.body.age_days,
            description: req.body.description,
            age_years: Number((req.body.age_days / 365).toFixed(1)),
            updatedAt: new Date()
        };

        // 5️ Update document
        const result = await collection.updateOne(
            { id: id },
            { $set: updatedFields }
        );

        // 6️ Send response
        if (result.modifiedCount > 0) {
            logger.info({ id, updatedFields }, 'Item updated successfully');
            res.json({ updated: "success" });
        } else {
            logger.warn({ id }, 'Item update failed');
            res.json({ updated: "failed" });
        }
    } catch (error) {
        logger.error({ error }, 'Error updating secondChanceItem');
        next(error);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    const id = req.params.id;
    try {
        // 1️ Connect to database
        const db = await connectToDatabase();

        // 2️ Get collection
        const collection = db.collection('secondChanceItems');

        // 3️ Check if item exists
        const existingItem = await collection.findOne({ id: id });

        if (!existingItem) {
            logger.warn({ id }, 'secondChanceItem not found for deletion');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // 4️ Delete item
        const result = await collection.deleteOne({ id: id });

        if (result.deletedCount > 0) {
            logger.info({ id }, 'Item deleted successfully');
            res.json({ deleted: "success" });
        } else {
            logger.warn({ id }, 'Item deletion failed');
            res.json({ deleted: "failed" });
        }
    } catch (error) {
        logger.error({ error }, 'Error deleting secondChanceItem');
        next(error);
    }
});

module.exports = router;
