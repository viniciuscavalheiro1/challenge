const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (Non-blocking async)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { page = 1, limit = 10, q } = req.query;
    let results = data;

    if (q) {
      const search = q.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(search) || 
        (item.description && item.description.toLowerCase().includes(search))
      );
    }

    const total = results.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = parseInt(page) * parseInt(limit);

    results = results.slice(startIndex, endIndex);

    res.json({
      items: results,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const { name, price, description } = req.body;
    
    // Basic validation
    if (!name || price === undefined) {
      const err = new Error('Name and price are required');
      err.status = 400;
      throw err;
    }

    const data = await readData();
    const newItem = {
      id: Date.now(),
      name,
      price: parseFloat(price),
      description: description || ''
    };

    data.push(newItem);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;