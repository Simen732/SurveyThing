const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const Feedback = require('../models/Feedback');
const argon2 = require('argon2');

describe('Admin Routes', () => {
  let adminAgent;
  let userAgent;
  let adminUser;
  let regularUser;

  beforeEach(async () => {
    // Create admin user
    const adminPassword = await argon2.hash('admin123');
    adminUser = await new User({
      username: 'admin',
      password: adminPassword,
      isAdmin: true
    }).save();

    // Create regular user
    const userPassword = await argon2.hash('password123');
    regularUser = await new User({
      username: 'user',
      password: userPassword,
      isAdmin: false
    }).save();

    // Create authenticated agents
    adminAgent = request.agent(app);
    userAgent = request.agent(app);

    // Login admin
    await adminAgent
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    // Login regular user
    await userAgent
      .post('/auth/login')
      .send({
        username: 'user',
        password: 'password123'
      });
  });

  describe('GET /admin/dashboard', () => {
    test('should show dashboard for admin user', async () => {
      const response = await adminAgent.get('/admin/dashboard');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Survey Dashboard');
    });

    test('should redirect non-admin to login', async () => {
      const response = await userAgent.get('/admin/dashboard');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/auth/login');
    });

    test('should redirect unauthenticated user to login', async () => {
      const response = await request(app).get('/admin/dashboard');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/auth/login');
    });
  });

  describe('Survey Creation', () => {
    test('should create new survey successfully', async () => {
      const surveyData = {
        title: 'Test Survey',
        description: 'Test Description',
        questions: JSON.stringify([
          {
            text: 'How satisfied are you?',
            type: 'rating',
            order: 1,
            options: []
          },
          {
            text: 'What is your preference?',
            type: 'multiple-choice',
            order: 2,
            options: [
              { text: 'Option 1', value: 'option_1' },
              { text: 'Option 2', value: 'option_2' }
            ]
          }
        ])
      };

      const response = await adminAgent
        .post('/admin/survey/new')
        .send(surveyData);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/admin/dashboard');

      const survey = await Survey.findOne({ title: 'Test Survey' });
      expect(survey).toBeTruthy();
      expect(survey.questions).toHaveLength(2);
      expect(survey.createdBy.toString()).toBe(adminUser._id.toString());
    });

    test('should not create survey without title', async () => {
      const surveyData = {
        description: 'Test Description',
        questions: JSON.stringify([])
      };

      const response = await adminAgent
        .post('/admin/survey/new')
        .send(surveyData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('error');
    });

    test('should not allow non-admin to create survey', async () => {
      const surveyData = {
        title: 'Test Survey',
        questions: JSON.stringify([])
      };

      const response = await userAgent
        .post('/admin/survey/new')
        .send(surveyData);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/auth/login');
    });
  });

  describe('Survey Management', () => {
    let testSurvey;

    beforeEach(async () => {
      testSurvey = await new Survey({
        title: 'Test Survey',
        description: 'Test Description',
        questions: [
          {
            text: 'Test Question',
            type: 'rating',
            order: 1,
            options: []
          }
        ],
        createdBy: adminUser._id,
        isActive: true
      }).save();
    });

    test('should toggle survey status', async () => {
      const response = await adminAgent
        .post(`/admin/survey/${testSurvey._id}/toggle`);

      expect(response.status).toBe(302);

      const updatedSurvey = await Survey.findById(testSurvey._id);
      expect(updatedSurvey.isActive).toBe(false);
    });

    test('should show survey results', async () => {
      const response = await adminAgent
        .get(`/admin/survey/${testSurvey._id}/results`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Survey Results');
      expect(response.text).toContain('Test Survey');
    });

    test('should show edit form', async () => {
      const response = await adminAgent
        .get(`/admin/survey/${testSurvey._id}/edit`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Edit Survey');
      expect(response.text).toContain('Test Survey');
    });

    test('should update survey successfully', async () => {
      const updateData = {
        title: 'Updated Survey Title',
        description: 'Updated Description',
        questions: JSON.stringify([
          {
            text: 'Updated Question',
            type: 'rating',
            order: 1,
            options: []
          }
        ])
      };

      const response = await adminAgent
        .post(`/admin/survey/${testSurvey._id}/edit`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Survey Updated');

      const updatedSurvey = await Survey.findById(testSurvey._id);
      expect(updatedSurvey.title).toBe('Updated Survey Title');
    });

    test('should delete inactive survey', async () => {
      // First deactivate the survey
      await Survey.findByIdAndUpdate(testSurvey._id, { isActive: false });

      const response = await adminAgent
        .post(`/admin/survey/${testSurvey._id}/delete`);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/admin/dashboard?deleted=true');

      const deletedSurvey = await Survey.findById(testSurvey._id);
      expect(deletedSurvey).toBeNull();
    });

    test('should not delete active survey', async () => {
      const response = await adminAgent
        .post(`/admin/survey/${testSurvey._id}/delete`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Cannot delete active surveys');

      const survey = await Survey.findById(testSurvey._id);
      expect(survey).toBeTruthy();
    });
  });
});