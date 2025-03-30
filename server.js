const sequelize = require('./db/postgress');
const express = require('express');
require('dotenv').config();
const routes = require('./routes/index');
const authenticate = require('./middleware/authMiddleware');


const PORT = process.env.PORT || 3000;


// Initialize Express app
const app = express();
app.use(express.json());


// --- Route ---
app.use('/api', routes);

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
