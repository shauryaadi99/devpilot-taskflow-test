const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Task = require('../src/models/Task');
const User = require('../src/models/User');

process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

describe('Task API Endpoints', () => {
  const userId = '507f1f77bcf86cd799439011';
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    // Mock user lookup in auth middleware
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: userId,
        id: userId,
        name: 'Jane Doe',
        email: 'jane@example.com'
      })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication protection', () => {
    it('should reject unauthenticated request to /api/tasks with 401', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/tasks', () => {
    it('should fail if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title provided' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide a task title');
    });

    it('should create a new task with default status Pending and priority Medium', async () => {
      const newTask = {
        _id: '607f1f77bcf86cd799439022',
        title: 'Complete Project Documentation',
        description: 'Write setup instructions',
        status: 'Pending',
        priority: 'Medium',
        user: userId,
        createdAt: new Date()
      };

      jest.spyOn(Task, 'create').mockResolvedValue(newTask);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Project Documentation',
          description: 'Write setup instructions'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Complete Project Documentation');
      expect(res.body.data.status).toBe('Pending');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return tasks list for user', async () => {
      const mockTasks = [
        {
          _id: '1',
          title: 'Task 1',
          status: 'Pending',
          priority: 'High',
          user: userId
        },
        {
          _id: '2',
          title: 'Task 2',
          status: 'Completed',
          priority: 'Low',
          user: userId
        }
      ];

      jest.spyOn(Task, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTasks)
      });

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should calculate task stats correctly', async () => {
      const mockAggregate = [
        { _id: 'Pending', count: 3 },
        { _id: 'In Progress', count: 2 },
        { _id: 'Completed', count: 5 }
      ];

      jest.spyOn(Task, 'aggregate').mockResolvedValue(mockAggregate);

      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(10);
      expect(res.body.data.pending).toBe(3);
      expect(res.body.data.inProgress).toBe(2);
      expect(res.body.data.completed).toBe(5);
      expect(res.body.data.completionRate).toBe(50);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return 404 if task not found', async () => {
      jest.spyOn(Task, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/tasks/607f1f77bcf86cd799439099')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return task if found', async () => {
      const mockTask = {
        _id: '607f1f77bcf86cd799439099',
        title: 'Specific Task',
        status: 'In Progress',
        user: userId
      };

      jest.spyOn(Task, 'findOne').mockResolvedValue(mockTask);

      const res = await request(app)
        .get('/api/tasks/607f1f77bcf86cd799439099')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Specific Task');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should reject invalid status value', async () => {
      const mockTask = {
        _id: '607f1f77bcf86cd799439099',
        title: 'Specific Task',
        status: 'Pending',
        user: userId,
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Task, 'findOne').mockResolvedValue(mockTask);

      const res = await request(app)
        .put('/api/tasks/607f1f77bcf86cd799439099')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'InvalidStatus' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Status must be');
    });

    it('should update task status to Completed', async () => {
      const mockTask = {
        _id: '607f1f77bcf86cd799439099',
        title: 'Specific Task',
        status: 'Pending',
        user: userId,
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this);
        })
      };

      jest.spyOn(Task, 'findOne').mockResolvedValue(mockTask);

      const res = await request(app)
        .put('/api/tasks/607f1f77bcf86cd799439099')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Completed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task and return success', async () => {
      jest.spyOn(Task, 'findOneAndDelete').mockResolvedValue({
        _id: '607f1f77bcf86cd799439099',
        user: userId
      });

      const res = await request(app)
        .delete('/api/tasks/607f1f77bcf86cd799439099')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });
  });
});

