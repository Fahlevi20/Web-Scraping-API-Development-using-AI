// controllers/scrapeController.js - API controller
const { scrapeEbayProducts } = require('../services/scraperService');

const scrapeProducts = async (req, res) => {
  try {
    const { keyword = 'nike', pages = 1 } = req.query;
    
    console.log(`Starting scrape for "${keyword}" across ${pages} pages...`);
    
    const products = await scrapeEbayProducts(keyword, parseInt(pages));
    
    res.json({
      success: true,
      query: { keyword, pages: parseInt(pages) },
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { scrapeProducts };