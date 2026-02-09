const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

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
        const db = await connectToDatabase()

        // 2 Get collection
        const collection = db.collection("secondChanceItems");

        // 3 Fetch all documents
        const secondChanceItems = await collection.find({}).toArray();

        // 4 Return as JSON
        res.json(secondChanceItems);

    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('image'), async(req, res,next) => {
    try {

        // 1 Connect to database
        const db = await connectToDatabase();

        // 2 Get all collection
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
        }

        // 7 Insert into database
        const result = await collection.insertOne(newItem);

        newItem._id = result.insertedId;
        
        res.status(201).json(secondChanceItem.ops[0]);
    } catch (e) {
        logger.error('Error adding new item:', error);
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
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // 6️ Return item
        res.json(secondChanceItem);

    } catch (e) {
        logger.error('Error fetching secondChanceItem:', error);
        next(e);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        const id = req.params.id;

        // 1️ Connect to database
        const db = await connectToDatabase();

        // 2️ Get collection
        const collection = db.collection('secondChanceItems');

        // 3️ Check if item exists
        const existingItem = await collection.findOne({ id: id });

        if (!existingItem) {
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
            res.json({ updated: "success" });
        } else {
            res.json({ updated: "failed" });
        }
    } catch (e) {
        logger.error('Error updating secondChanceItem:', error);
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        // 1️ Connect to database
        const db = await connectToDatabase();

        // 2️ Get collection
        const collection = db.collection('secondChanceItems');

        // 3️ Check if item exists
        const existingItem = await collection.findOne({ id: id });

        if (!existingItem) {
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // 4️ Delete item
        const result = await collection.deleteOne({ id: id });

        if (result.deletedCount > 0) {
            res.json({ deleted: "success" });
        } else {
            res.json({ deleted: "failed" });
        }
    } catch (e) {
        logger.error('Error deleting secondChanceItem:', error);
        next(e);
    }
});

module.exports = router;
