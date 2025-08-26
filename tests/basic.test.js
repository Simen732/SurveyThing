const request = require('supertest');
const app = require('../app');

describe('Basic Application Tests', () => {
  describe('Application Setup', () => {
    test('should export app correctly', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    test('should have required middleware', () => {
      // Test that app has basic properties
      expect(app._router).toBeDefined();
    });
  });

  describe('Public Routes (No Database)', () => {
    test('should show homepage', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Survey App');
      expect(response.text).toContain('Professional Survey Platform');
    });

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

    test('should redirect admin routes to login when not authenticated', async () => {
      const adminRoutes = [
        '/admin/dashboard',
        '/admin/survey/new'
      ];

      for (const route of adminRoutes) {
        const response = await request(app).get(route);
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      }
    });

    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent-route-12345');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Form Validation', () => {
    test('should handle empty login form', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      // Should not crash and should return some response
      expect([200, 400, 422]).toContain(response.status);
    });

    test('should handle empty register form', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({});

      // Should not crash and should return some response
      expect([200, 400, 422]).toContain(response.status);
    });

    test('should handle malformed JSON in requests', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Security Headers', () => {
    test('should not expose sensitive information in responses', async () => {
      const response = await request(app).get('/');
      
      // Should not expose server information
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    test('should handle potential XSS in URL parameters', async () => {
      const maliciousScript = '<script>alert("xss")</script>';
      const encodedScript = encodeURIComponent(maliciousScript);
      
      const response = await request(app).get(`/survey/${encodedScript}`);
      
      // Should handle gracefully without executing script
      expect([200, 400, 404, 500]).toContain(response.status);
      if (response.text) {
        expect(response.text).not.toContain('<script>alert("xss")</script>');
      }
    });
  });
});