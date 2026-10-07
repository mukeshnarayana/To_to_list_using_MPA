const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../Server/models/users');

describe('Auth API Endpoints (/api/auth)', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Jest Test User',
    email: `jest_test_${timestamp}@example.com`,
    password: 'password123',
  };

  let authToken = '';

  afterAll(async () => {
    // Cleanup created test user
    await User.deleteMany({ email: { $regex: 'jest_test_' } });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully with 201', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Incomplete User' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with 400 if email is already registered', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should authenticate user and return 200 with JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');

      // Save token for protected route tests
      authToken = res.body.token;
    });

    it('should reject invalid password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: 'wrong_password_123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject non-existent email with 401', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: `non_existent_${Date.now()}@example.com`,
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should fail with 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email: testUser.email });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile with 200 when token is valid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('name', testUser.name);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject request with 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('should reject request with 401 when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_random_token_string');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/not authorized/i);
    });
  });
});
