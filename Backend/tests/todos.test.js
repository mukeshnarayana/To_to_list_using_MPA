const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../Server/models/users');
const Todo = require('../Server/models/todos');

describe('Todos API Endpoints (/api/todos)', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Todo Test User',
    email: `todo_tester_${timestamp}@example.com`,
    password: 'password123',
  };

  let authToken = '';
  let createdTodoId = '';

  beforeAll(async () => {
    // Register and sign in to obtain auth token
    await request(app).post('/api/auth/signup').send(testUser);
    const signinRes = await request(app).post('/api/auth/signin').send({
      email: testUser.email,
      password: testUser.password,
    });
    authToken = signinRes.body.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await Todo.deleteMany({ title: { $regex: 'Jest' } });
    await User.deleteMany({ email: { $regex: 'todo_tester_' } });
    await mongoose.connection.close();
  });

  describe('POST /api/todos', () => {
    it('should create a new todo with 201 when authenticated', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Jest Test Todo',
          description: 'Testing task creation with jest & supertest',
          priority: 'high',
          status: 'pending',
          tags: ['jest', 'automated'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Jest Test Todo');
      expect(res.body.priority).toBe('high');
      expect(res.body.status).toBe('pending');

      createdTodoId = res.body._id;
    });

    it('should fail with 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title provided' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/title is required/i);
    });

    it('should fail with 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Unauthorized Todo' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/todos', () => {
    it('should return paginated list of todos with 200', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('todos');
      expect(Array.isArray(res.body.todos)).toBe(true);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('pages');
    });

    it('should filter todos by status', async () => {
      const res = await request(app)
        .get('/api/todos?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      res.body.todos.forEach((item) => {
        expect(item.status).toBe('pending');
      });
    });

    it('should filter todos by priority', async () => {
      const res = await request(app)
        .get('/api/todos?priority=high')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      res.body.todos.forEach((item) => {
        expect(item.priority).toBe('high');
      });
    });

    it('should search todos by keyword', async () => {
      const res = await request(app)
        .get('/api/todos?search=Jest')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.todos.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return single todo by id with 200', async () => {
      const res = await request(app)
        .get(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(createdTodoId);
      expect(res.body.title).toBe('Jest Test Todo');
    });

    it('should return 404 for non-existent todo id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/todo not found/i);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo fields with 200', async () => {
      const res = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Jest Todo Title',
          priority: 'medium',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Jest Todo Title');
      expect(res.body.priority).toBe('medium');
    });

    it('should return 404 when updating non-existent todo', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Title' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle status to completed with 200', async () => {
      const res = await request(app)
        .patch(`/api/todos/${createdTodoId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    it('should toggle status back to pending with 200', async () => {
      const res = await request(app)
        .patch(`/api/todos/${createdTodoId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('pending');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should reject deleting an uncompleted todo with 404 (Todo not yet completed)', async () => {
      // Currently the todo status is 'pending'
      const res = await request(app)
        .delete(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/todo not yet completed/i);
    });

    it('should successfully delete a completed todo with 200', async () => {
      // Toggle to completed first
      await request(app)
        .patch(`/api/todos/${createdTodoId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      // Now delete
      const res = await request(app)
        .delete(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/todo deleted successfully/i);
    });
  });
});
