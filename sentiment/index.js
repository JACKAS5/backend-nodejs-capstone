// Step 1: Import required packages
require('dotenv').config();
const express = require('express');
const logger = require('./logger');
const expressPino = require('express-pino-logger')({ logger });

// Task 1: Import the Natural library
const natural = require('natural');

// Task 2: Initialize the Express server
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(expressPino);

// Task 3: Create the POST /sentiment endpoint
app.post('/sentiment', async (req, res) => {
    try {
        // Task 4: Extract the sentence parameter from request body
        const { sentence } = req.body;

        if (!sentence) {
            logger.error('No sentence provided');
            return res.status(400).json({ error: 'No sentence provided' });
        }

        // Initialize the sentiment analyzer
        const Analyzer = natural.SentimentAnalyzer;
        const stemmer = natural.PorterStemmer;
        const analyzer = new Analyzer("English", stemmer, "afinn");

        // Perform sentiment analysis
        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        // Task 5: Determine sentiment
        let sentiment = "neutral";
        if (analysisResult < 0) {
            sentiment = "negative";
        } else if (analysisResult > 0.33) {
            sentiment = "positive";
        }

        // Log the result
        logger.info(`Sentiment analysis result: ${analysisResult}, sentiment: ${sentiment}`);

        // Task 6: Send success response
        res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment });

    } catch (error) {
        logger.error(`Error performing sentiment analysis: ${error}`);

        // Task 7: Return error response
        res.status(500).json({ message: 'Error performing sentiment analysis' });
    }
});

// Start the server
app.listen(port, () => {
    logger.info(`Sentiment analysis server running on port ${port}`);
});
