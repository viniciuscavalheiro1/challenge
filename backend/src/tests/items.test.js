const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

describe('Items API', () => {
  let originalData;

  beforeAll(async () => {
    // Backup data
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    originalData = JSON.parse(raw);
  });

  afterAll(async () => {
    // Restore data
    await fs.writeFile(DATA_PATH, JSON.stringify(originalData, null, 2));
  });

  describe('GET /api/items', () => {
    it('should return a paginated list of items', async () => {
      const res = await request(app).get('/api/items?page=1&limit=5');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body.items.length).toBeLessThanOrEqual(5);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
    });

    it('should filter items by search query', async () => {
      const res = await request(app).get('/api/items?q=test');
      expect(res.statusCode).toEqual(200);
      res.body.items.forEach(item => {
        const match = item.name.toLowerCase().includes('test') || 
                      (item.description && item.description.toLowerCase().includes('test'));
        expect(match).toBe(true);
      });
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'New Test Item',
        price: 99.99,
        description: 'A test item'
      };
      const res = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newItem.name);
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ price: 10 });
      
      expect(res.statusCode).toEqual(400);
    });
  });
});
