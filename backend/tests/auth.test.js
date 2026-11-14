const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');

process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

describe('Auth API Endpoints', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.message).toContain('TaskFlow API is running');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide name, email, and password');
    });

    it('should fail if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 6 characters');
    });

    it('should fail if user already exists', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '123', email: 'john@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User already exists');
    });

    it('should successfully register a new user', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('jane@example.com');
      expect(res.body.user.name).toBe('Jane Doe');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail if email or password missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid credentials if user not found', async () => {
      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should fail with invalid password', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should successfully log in and return token', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('jane@example.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when invalid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user profile when valid token provided', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

      const mockUser = {
        _id: userId,
        id: userId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date()
      };

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('jane@example.com');
    });
  });
});

