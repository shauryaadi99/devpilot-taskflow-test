/**
 * Simple in‑memory rate limiter middleware.
 * Limits each IP to a maximum number of requests within a time window.
 */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // max requests per window per IP

// Map to track request count and window start per IP
const ipRecords = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();

  const record = ipRecords.get(ip) || { count: 0, start: now };

  // Reset count if window has passed
  if (now - record.start > WINDOW_MS) {
    record.count = 1;
    record.start = now;
  } else {
    record.count += 1;
  }

  ipRecords.set(ip, record);

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }

  next();
}

module.exports = rateLimiter;
