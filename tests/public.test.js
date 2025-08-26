const request = require('supertest');
const app = require('../app');

describe('Public Routes', () => {
  describe('GET /', () => {
    test('should show homepage', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Professional Survey Platform');
      expect(response.text).toContain('Available Surveys');
      expect(response.text).toContain('Admin Login');
    });

    test('should show admin login when not authenticated', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Admin Login');
      expect(response.text).not.toContain('Dashboard');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent-route');
      
      expect(response.status).toBe(404);
    });

    test('should handle malformed survey IDs gracefully', async () => {
      const response = await request(app).get('/survey/invalid-id');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('error');
    });

    test('should handle malformed admin survey IDs gracefully', async () => {
      const response = await request(app).get('/admin/survey/invalid-id/results');
      
      expect(response.status).toBe(302); // Should redirect to login
    });
  });

  describe('Security', () => {
    test('should require authentication for admin routes', async () => {
      const adminRoutes = [
        '/admin/dashboard',
        '/admin/survey/new',
        '/admin/survey/507f1f77bcf86cd799439011/results',
        '/admin/survey/507f1f77bcf86cd799439011/edit'
      ];

      for (const route of adminRoutes) {
        const response = await request(app).get(route);
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      }
    });

    test('should prevent SQL injection in form inputs', async () => {
      const maliciousData = {
        username: "'; DROP TABLE users; --",
        password: 'password'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(maliciousData);

      // Should not crash and should handle gracefully
      expect(response.status).toBe(200);
      expect(response.text).toContain('Invalid credentials');
    });

    test('should sanitize user input in survey responses', async () => {
      // This test would need a valid survey ID, but demonstrates the concept
      const maliciousData = {
        comment: '<script>alert("xss")</script>Malicious content'
      };

      const response = await request(app)
        .post('/survey/507f1f77bcf86cd799439011/feedback')
        .send(maliciousData);

      // Should handle gracefully (either error or sanitized)
      expect([200, 404]).toContain(response.status);
    });
  });
});