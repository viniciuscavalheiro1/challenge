const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;
let lastMtime = 0;

// Function to calculate stats
const calculateStats = (items) => {
  if (items.length === 0) return { total: 0, averagePrice: 0 };
  return {
    total: items.length,
    averagePrice: items.reduce((acc, cur) => acc + (cur.price || 0), 0) / items.length
  };
};

// GET /api/stats
router.get('/', (req, res, next) => {
  fs.stat(DATA_PATH, (err, stats) => {
    if (err) return next(err);

    const mtime = stats.mtimeMs;

    // Check if file has changed since last cache
    if (cachedStats && mtime === lastMtime) {
      return res.json(cachedStats);
    }

    // Read and recalculate
    fs.readFile(DATA_PATH, 'utf8', (readErr, raw) => {
      if (readErr) return next(readErr);

      try {
        const items = JSON.parse(raw);
        cachedStats = calculateStats(items);
        lastMtime = mtime;
        res.json(cachedStats);
      } catch (parseErr) {
        next(parseErr);
      }
    });
  });
});

module.exports = router;