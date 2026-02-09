const express = require("express");
const router = express.Router();
const connectToDatabase = require("../models/db");

// Search for secondChanceItems
router.get("/", async (req, res, next) => {
    try {
    // Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");

        // Initialize the query object
        const query = {};

        // Task 2: Add the name filter if the name parameter exists and is not empty
        if (req.query.name && req.query.name.trim() !== "") {
            query.name = { $regex: req.query.name.trim(), $options: "i" }; // Partial match, case-insensitive
        }

        // Task 3: Add other filters to the query
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.condition) {
            query.condition = req.query.condition;
        }
        if (req.query.age_years) {
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        // Task 4: Fetch filtered items
        const items = await collection.find(query).toArray();

        res.json(items);
    } catch (e) {
        console.error("Error searching items:", e);
        next(e);
    }
});

module.exports = router;
