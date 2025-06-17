const express = require('express');
const routes = require('./routes');

const app = express();

// Parse JSON
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('API is working!');
});

// Mount routes
app.use('/api', routes);

// Export app to be used by server.js
module.exports = app;
