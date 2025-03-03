// utils/helpers.js - Utility functions
/**
 * Creates a delay using promises
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { delay };