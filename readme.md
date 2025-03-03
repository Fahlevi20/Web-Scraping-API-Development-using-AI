# eBay Scraper API with AI Enhancement

This project is a web scraping API that extracts product information from eBay search results and uses AI to enhance the data. The API scrapes product listings for a given keyword, including product names, prices, and descriptions, and returns the results in JSON format.

## Features

- 🔍 Scrapes eBay product listings based on search keywords
- 📄 Extracts product name, price, and detailed description from product pages
- 🤖 Uses AI to enhance product data with category classification and summary
- 📊 Handles pagination to scrape multiple pages of results
- 🚀 Returns well-structured JSON data

## Tech Stack

- **Backend**: Node.js with Express.js
- **Scraping**: Puppeteer for browser automation
- **AI Integration**: OpenAI API (or Deepseek API)
- **Error Handling**: Robust error handling and rate limiting

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/ebay-scraper.git
   cd ebay-scraper
   ```

2. Install dependencies:
   ```
   npm install or yarn install
   ```

3. Create a `.env` file in the root directory with the following contents:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the server:
   ```
   y start
   ```

## API Usage

### Endpoint: GET `/api/scrape`

Scrapes eBay product listings for a given keyword.

#### Query Parameters:

- `keyword` (optional): Search term for eBay products (default: 'nike')
- `pages` (optional): Number of pages to scrape (default: 1)

#### Example Request:

```
GET http://localhost:3000/api/scrape?keyword=adidas&pages=2
```

#### Example Response:

```json
{
  "success": true,
  "query": {
    "keyword": "adidas",
    "pages": 2
  },
  "count": 48,
  "products": [
    {
      "title": "Adidas Ultraboost 21 Men's Running Shoes",
      "price": "$120.00",
      "url": "https://www.ebay.com/itm/123456789",
      "description": "Brand new Adidas Ultraboost 21 running shoes. Features Primeknit upper and Boost cushioning for maximum comfort and performance.",
      "enhancedData": {
        "category": "Athletic Shoes",
        "condition": "New",
        "summary": "New Adidas Ultraboost 21 men's running shoes with Primeknit upper and Boost cushioning technology."
      }
    },
    // More products...
  ]
}
```

## Error Handling

The API includes robust error handling:

- If a product doesn't have a price or description, it returns '-'
- If scraping fails for a specific product, it continues with others
- If the AI enhancement fails, it returns the original data without enhancements

## AI Integration

The API uses AI (OpenAI's GPT model or Deepseek) to:

1. Categorize products based on title and description
2. Determine product condition from description
3. Generate concise product summaries

To switch from OpenAI to Deepseek, modify the `aiService.js` file with the appropriate Deepseek API implementation.

## Rate Limiting and Ethical Scraping

The scraper implements:

- Random delays between requests to respect eBay's servers
- User-agent headers to identify the scraper
- Error handling for rate limiting responses

## Extending the Project

### Add More AI Features

You can extend the AI functionality by modifying the `enhanceProductData` function in `aiService.js`.

### Add a Frontend

You can create a simple frontend to visualize the scraped data using React, Vue, or any other frontend framework.

## License

MIT