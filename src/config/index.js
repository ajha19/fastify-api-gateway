require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',
  upstreamUrl: process.env.UPSTREAM_URL || 'http://localhost:4000',
  upstreamTimeout: parseInt(process.env.UPSTREAM_TIMEOUT, 10) || 2000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 10,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000, // 1 minute
  // Add more config as needed, e.g., database URLs, API keys, etc.
};

module.exports = config;
