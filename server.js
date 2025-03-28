const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const sequelize = require('./db/postgress');

const PORT = process.env.PORT || 3000;


// Initialize Express app
const app = express();
app.use(express.json());


// --- Routes ---
const videoRoutes = require('./routes/videoRoutes');
const aiRoutes = require('./routes/aiRoutes');
const courseRoute = require('./routes/courseRoute');
const authenticate = require('./middleware/authMiddleware');

// Use the routes
app.use('/api', videoRoutes);
app.use('/api', aiRoutes); 
app.use('/api', courseRoute); 
// Example of a protected route
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'You are authorized!', user: req.user });
});


app.get('/', (req, res) => {
  res.send('Hello, World!');
});


// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function startServer() {
  try {
    // Authenticate and optionally sync your models
    await sequelize.authenticate();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the Postgres database:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
