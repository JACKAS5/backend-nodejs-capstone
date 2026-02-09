// test-db.js
const connectToDatabase = require("./db");

async function testConnection () {
    try {
        const db = await connectToDatabase();
        console.log("Database connected successfully");

        // Optional: list all collections to make sure it works
        const collections = await db.collections();
        console.log("Collections in DB:", collections.map(c => c.collectionName));

        // Optional: count documents in secondChanceItems
        const count = await db.collection("secondChanceItems").countDocuments();
        console.log("secondChanceItems count:", count);

        process.exit(0); // exit after testing
    } catch (error) {
        console.error("Database test failed:", error);
        process.exit(1); // exit with error
    }
}

testConnection();
