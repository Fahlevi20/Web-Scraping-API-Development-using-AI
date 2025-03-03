// services/scraperService.js - Core scraping functionality
const puppeteer = require('puppeteer');
const { enhanceProductData } = require('./aiService');
const { delay } = require('../utils/helpers');

/**
 * Scrapes eBay product listings for a given keyword across multiple pages
 * @param {string} keyword - Search term
 * @param {number} pagesToScrape - Number of pages to scrape
 * @returns {Array} - Array of product objects
 */
const scrapeEbayProducts = async (keyword, pagesToScrape = 1) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const allProducts = [];
    
    for (let currentPage = 1; currentPage <= pagesToScrape; currentPage++) {
      console.log(`Scraping page ${currentPage} of ${pagesToScrape}`);
      
      // Navigate to search page
      const url = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${encodeURIComponent(keyword)}&_sacat=0&rt=nc&_pgn=${currentPage}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Extract product links and basic data from search page
      const productsOnPage = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.s-item__pl-on-bottom'));
        return items.map(item => {
          const titleElement = item.querySelector('.s-item__title');
          const priceElement = item.querySelector('.s-item__price');
          const linkElement = item.querySelector('.s-item__link');
          
          return {
            title: titleElement ? titleElement.innerText.trim() : '-',
            price: priceElement ? priceElement.innerText.trim() : '-',
            url: linkElement ? linkElement.href : null
          };
        }).filter(item => item.title !== 'Shop on eBay' && item.url !== null);
      });
      
      // Visit each product page to get description
      for (let i = 0; i < productsOnPage.length; i++) {
        const product = productsOnPage[i];
        console.log(`Processing product ${i + 1}/${productsOnPage.length}: ${product.title}`);
        
        if (product.url) {
          try {
            await page.goto(product.url, { waitUntil: 'networkidle2', timeout: 45000 });
            
            // Extract product description
            const description = await page.evaluate(() => {
              // Try different selectors for description
              const descriptionElement = document.querySelector('#ds_div') || 
                                        document.querySelector('.item-description') || 
                                        document.querySelector('[data-testid="ux-layout-section-evo:item-description"]');
              
              return descriptionElement ? descriptionElement.innerText.trim() : '-';
            });
            
            // Add description to product
            product.description = description || '-';
            
            // Use AI to enhance product data
            const enhancedProduct = await enhanceProductData(product);
            allProducts.push(enhancedProduct);
            
            // Respect website by adding delay between requests
            await delay(1000 + Math.random() * 2000);
          } catch (err) {
            console.error(`Error processing product ${product.url}:`, err.message);
            product.description = '-';
            product.error = err.message;
            allProducts.push(product);
          }
        }
      }
      
      // Add delay between pagination to avoid rate limiting
      if (currentPage < pagesToScrape) {
        await delay(3000 + Math.random() * 2000);
      }
    }
    
    return allProducts;
    
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeEbayProducts };