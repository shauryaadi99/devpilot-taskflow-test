const rateLimit = require('express-rate-limit');

let store;
// Attempt to use Redis for a distributed store if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    const { createClient } = require('redis');
    const RedisStore = require('rate-limit-redis');
    const redisClient = createClient({ url: process.env.REDIS_URL });
    // Connect in background; errors will be logged but not crash the app
    redisClient.connect().catch((err) => console.error('Redis connection error:', err));
    store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
  } catch (e) {
    console.warn('Redis store unavailable, falling back to in‑memory rate limiter');
    store = undefined; // express-rate-limit will use default MemoryStore
  }
}

// Configure rate limiting: max 5 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store,
});

module.exports = limiter;
