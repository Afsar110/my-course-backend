require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { default: axios } = require('axios');

// Load API key from environment variables (this is redundant if you're loading it in server.js)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI (this is also redundant if you're initializing it in server.js)
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);


const listModels = async (req, res) => {

try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`);
    res.json(response?.data || 'No model available');
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
}
module.exports = {
  listModels
};