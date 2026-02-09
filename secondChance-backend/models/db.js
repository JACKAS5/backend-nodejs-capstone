// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {
    if (dbInstance){
        return dbInstance
    };

    try {
        // Create a new MongoClient with modern options
        const client = new MongoClient(url);

        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        // Store the database instance
        dbInstance = client.db(dbName);
        return dbInstance;

    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

module.exports = connectToDatabase;
