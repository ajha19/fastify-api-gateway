require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',
  // Add more config as needed, e.g., database URLs, API keys, etc.
};

module.exports = config;
