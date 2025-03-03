// Install dependencies before running: npm install express puppeteer openai dotenv

require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function scrapeEcommerce(url) {
    console.log(`Starting scraping process for URL: ${url}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log("Opening browser and navigating to page...");
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log("Extracting product data...");
    const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.s-item')).map(product => {
            return {
                name: product.querySelector('.s-item__title')?.innerText || '-',
                price: product.querySelector('.s-item__price')?.innerText || '-',
                link: product.querySelector('.s-item__link')?.href || '-'
            };
        });
    });
    console.log(`Extracted ${products.length} products.`);

    for (let product of products) {
        if (product.link !== '-') {
            console.log(`Fetching product details for: ${product.name}`);
            const detailPage = await browser.newPage();
            await detailPage.goto(product.link, { waitUntil: 'networkidle2' });
            product.description = await detailPage.evaluate(() => {
                return document.querySelector('#desc_ifr')?.innerText || '-';
            });
            await detailPage.close();
        }
    }
    
    await browser.close();
    console.log("Scraping process completed.");
    return products;
}

async function summarizeDescription(description) {
    if (description === '-') return '-';
    console.log("Summarizing product description...");
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'system', content: 'Summarize this product description.' }, { role: 'user', content: description }],
        max_tokens: 16.384,
        functions: [
            {
                name: "summarize_text",
                description: "Summarizes the given text into a concise form",
                parameters: {
                    type: "object",
                    properties: {
                        text: { type: "string", description: "The text to summarize" }
                    },
                    required: ["text"]
                }
            }
        ],
        function_call: { name: "summarize_text" }
    });
    console.log("Summarization completed.");
    return response.choices[0].message.content;
}

app.get('/scrape', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    try {
        console.log("Received scraping request...");
        let products = await scrapeEcommerce(url);
        for (let product of products) {
            product.description = await summarizeDescription(product.description);
        }
        console.log("Returning scraped data as JSON response.");
        res.json(products);
    } catch (error) {
        console.error("Error occurred during scraping: ", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
