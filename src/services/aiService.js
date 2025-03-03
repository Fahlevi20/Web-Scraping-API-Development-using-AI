// services/aiService.js - AI integration for data enhancement
const axios = require('axios');
const { delay } = require('../utils/helpers');

/**
 * Enhances product data using AI
 * @param {Object} product - Product object with raw data
 * @returns {Object} - Enhanced product object
 */
const enhanceProductData = async (product) => {
  try {
    // Skip AI enhancement if product is missing critical data
    if (product.title === '-' || !product.description || product.description === '-') {
      console.log('Skipping AI enhancement for incomplete product data');
      return {
        ...product,
        enhancedData: {
          category: '-',
          condition: '-',
          summary: '-'
        }
      };
    }
    
    // Using Deepseek API (or alternatively OpenAI)
    // If you prefer to use Deepseek, replace with the appropriate API call
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a product data analyzer. Extract and summarize key information from product listings.'
          },
          {
            role: 'user',
            content: `Analyze this eBay product and return a JSON object with the following fields:
              1. category: The likely product category
              2. condition: The product condition if mentioned (new, used, refurbished, etc.)
              3. summary: A concise 1-2 sentence summary of the product
              
              Product Title: ${product.title}
              Product Price: ${product.price}
              Product Description: ${product.description.substring(0, 1000)}...`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    const aiResponse = response.data.choices[0].message.content;
    let enhancedData;
    
    try {
      enhancedData = JSON.parse(aiResponse);
    } catch (err) {
      console.error('Error parsing AI response:', err);
      enhancedData = {
        category: '-',
        condition: '-',
        summary: '-'
      };
    }
    
    return {
      ...product,
      enhancedData
    };
    
  } catch (error) {
    console.error('AI enhancement error:', error.message);
    // Return original product if AI enhancement fails
    return {
      ...product,
      enhancedData: {
        category: '-',
        condition: '-',
        summary: '-'
      }
    };
  }
};

module.exports = { enhanceProductData };