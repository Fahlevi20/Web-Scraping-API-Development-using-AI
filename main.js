// Install dependencies before running: npm install express puppeteer openai dotenv

require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');
const fs = require('fs');  // ✅ Tambahkan ini

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function scrapeEcommerce(url) {
    console.log(`Starting scraping process for URL: ${url}`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    console.log("Opening browser and navigating to page...");
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log("Extracting product data...");
    let products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.s-item')).slice(0, 4).map(product => ({
            name: product.querySelector('.s-item__title')?.innerText.trim() || '-',
            price: product.querySelector('.s-item__price')?.innerText.trim() || '-',
            link: product.querySelector('.s-item__link')?.href || '-',
            description: '-'  // Default before scraping detail page
        }));
    });

    console.log(`Extracted ${products.length} products.`);

    for (let product of products) {
        if (product.link !== '-') {
            console.log(`Fetching product details for: ${product.name}`);
            const detailPage = await browser.newPage();
            await detailPage.goto(product.link, { waitUntil: 'networkidle2' });

            product.description = await detailPage.evaluate(() => {
                const descElement = document.querySelector('#desc_ifr, .item-desc, .d-item-description');
                if (descElement) {
                    return descElement.innerText.trim();
                }

                // If the description is in an iframe
                const iframe = document.querySelector('#desc_ifr');
                if (iframe) {
                    return iframe.contentWindow.document.body.innerText.trim();
                }

                return '-';
            });

            await detailPage.close();
        }
    }

    await browser.close();
    console.log("Scraping process completed.");
    return products;
}

async function summarizeDescription(description) {
    if (!description || description === '-') return '-';

    console.log("Summarizing product description...");
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Summarize this product description in a concise and clear way.' },
                { role: 'user', content: description }
            ],
            max_tokens: 100
        });

        console.log("Summarization completed.");
        return response.choices[0]?.message?.content.trim() || '-';
    } catch (error) {
        console.error("Error in summarization: ", error.message);
        return '-';
    }
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

        console.log("Saving scraped data to JSON file...");
        fs.writeFileSync('output.json', JSON.stringify(products, null, 2));  // ✅ Simpan ke file

        console.log("Returning scraped data as JSON response.");
        res.json(products);
    } catch (error) {
        console.error("Error occurred during scraping: ", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint untuk mengunduh file JSON
app.get('/download', (req, res) => {
    const filePath = 'output.json';
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'products.json', (err) => {
            if (err) console.error("Error in downloading file: ", err.message);
        });
    } else {
        res.status(404).json({ error: 'File not found. Please run /scrape first.' });
    }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
