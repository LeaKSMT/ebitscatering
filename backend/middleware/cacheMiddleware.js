// Simple in-memory cache for production use
const cache = new Map();

// Cache configuration
const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,    // 5 minutes
  MEDIUM: 30 * 60 * 1000,  // 30 minutes
  LONG: 2 * 60 * 60 * 1000  // 2 hours
};

// Cache middleware factory
const cacheMiddleware = (ttl = CACHE_TTL.MEDIUM) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return originalJson.call(this, data);
    };

    next();
  };
};

// Cache helper functions
const cacheHelpers = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  set: (key, data, ttl = CACHE_TTL.MEDIUM) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  },
  
  delete: (key) => {
    cache.delete(key);
  },
  
  clear: () => {
    cache.clear();
  },
  
  // Clean expired entries
  cleanup: () => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        cache.delete(key);
      }
    }
  }
};

// Auto-cleanup every 10 minutes
setInterval(cacheHelpers.cleanup, 10 * 60 * 1000);

// Cache invalidation routes
const invalidateCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

module.exports = {
  cacheMiddleware,
  cacheHelpers,
  invalidateCache,
  CACHE_TTL
};
