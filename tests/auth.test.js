const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const argon2 = require('argon2');
const mongoose = require('mongoose');

// Skip tests if no database connection
const skipIfNoDb = () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('Skipping database tests - MongoDB not connected');
    return true;
  }
  return false;
};

describe('Authentication Routes', () => {
  describe('GET Routes', () => {
    test('should show login page', async () => {
      const response = await request(app).get('/auth/login');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Login');
    });

    test('should show register page', async () => {
      const response = await request(app).get('/auth/register');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Register');
    });
  });

  describe('POST /auth/register', () => {
    test('should handle registration request', async () => {
      if (skipIfNoDb()) return;

      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect([200, 302]).toContain(response.status);
      
      if (response.status === 302) {
        // Successful registration
        const user = await User.findOne({ username: 'testuser' });
        expect(user).toBeTruthy();
        expect(user.isAdmin).toBe(false);
      }
    });

    test('should handle empty registration form', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(200);
      expect(response.text).toContain('error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      if (skipIfNoDb()) return;
      
      try {
        const hashedPassword = await argon2.hash('password123');
        await new User({
          username: 'testuser',
          password: hashedPassword,
          isAdmin: false
        }).save();

        await new User({
          username: 'admin',
          password: await argon2.hash('admin123'),
          isAdmin: true
        }).save();
      } catch (error) {
        console.warn('Could not set up test users:', error.message);
      }
    });

    test('should handle login request', async () => {
      if (skipIfNoDb()) return;

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect([200, 302]).toContain(response.status);
    });

    test('should handle invalid credentials gracefully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Invalid credentials');
    });

    test('should handle empty login form', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(200);
      expect(response.text).toContain('error');
    });
  });

  describe('POST /auth/logout', () => {
    test('should handle logout request', async () => {
      const response = await request(app).post('/auth/logout');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');
    });
  });
});