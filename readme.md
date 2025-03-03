# Web Scraping API Development using AI

## 📌 Overview
This project is a web scraping API built using **Node.js**, **Express**, **Puppeteer**, and **OpenAI**. It scrapes product data from e-commerce websites, summarizes descriptions using OpenAI, and allows users to download the scraped data as a JSON file.

## 🚀 Features
- ✅ Scrape product data from eBay (title, price, link, and description)
- ✅ Summarize product descriptions using OpenAI's GPT-4o
- ✅ Save scraped data to a JSON file
- ✅ Download the JSON file via an API endpoint

## 📦 Installation

### 1️⃣ Clone the repository:
```sh
git clone https://github.com/your-repo/web-scraping-api.git
cd web-scraping-api
```

### 2️⃣ Install dependencies:
```sh
npm install or yarn install
```

### 3️⃣ Set up environment variables:
Create a `.env` file and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

## ▶ Usage

### **1️⃣ Start the server**
```sh
yarn node main.js
```
The server will run on `http://localhost:3000`

### **2️⃣ Scrape product data**
Send a GET request to:
```sh
http://localhost:3000/scrape?url=your_target_url
```
Example:
```sh
http://localhost:3000/scrape?url=https://www.ebay.com/sch/i.html?_nkw=dell+g+15
```

**Response:** JSON with product details.

### **3️⃣ Download scraped data**
Send a GET request to:
```sh
http://localhost:3000/download
```
This will return a JSON file (`products.json`).

## 🛠 API Endpoints
| Method | Endpoint          | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/scrape?url=URL`  | Scrapes product data from the given URL |
| GET    | `/download`       | Downloads the scraped data as JSON |

## ⚡ Technologies Used
- **Node.js** - JavaScript runtime
- **Express.js** - Backend framework
- **Puppeteer** - Web scraping
- **OpenAI API** - Text summarization
- **dotenv** - Manage environment variables

## 📝 Notes
- Ensure you have a valid **OpenAI API key** before running the project.
- Modify the **Puppeteer selectors** if scraping another e-commerce site.
- Scraping should be done ethically and in compliance with the website's **robots.txt** policies.

## 📜 License
This project is open-source and available under the MIT License.

