// Install dependencies before running: npm install express puppeteer openai dotenv

require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function scrapeEcommerce(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.s-item')).map(product => {
            return {
                name: product.querySelector('.s-item__title')?.innerText || '-',
                price: product.querySelector('.s-item__price')?.innerText || '-',
                link: product.querySelector('.s-item__link')?.href || '-'
            };
        });
    });

    for (let product of products) {
        if (product.link !== '-') {
            const detailPage = await browser.newPage();
            await detailPage.goto(product.link, { waitUntil: 'networkidle2' });
            product.description = await detailPage.evaluate(() => {
                return document.querySelector('#desc_ifr')?.innerText || '-';
            });
            await detailPage.close();
        }
    }
    
    await browser.close();
    return products;
}

async function summarizeDescription(description) {
    if (description === '-') return '-';
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'system', content: 'Summarize this product description.' }, { role: 'user', content: description }],
        max_tokens: 100
    });
    return response.choices[0].message.content;
}

app.get('/scrape', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    try {
        let products = await scrapeEcommerce(url);
        for (let product of products) {
            product.description = await summarizeDescription(product.description);
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
