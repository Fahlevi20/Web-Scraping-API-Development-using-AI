// app.js - Main application file
const express = require('express');
const dotenv = require('dotenv');
const { scrapeProducts } = require('./controllers/scrapeController');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('eBay Scraper API is running. Use /api/scrape?keyword=nike&pages=3 to get started.');
});

app.get('/api/scrape', scrapeProducts);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;