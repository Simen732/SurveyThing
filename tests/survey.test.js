const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const Feedback = require('../models/Feedback');
const argon2 = require('argon2');

describe('Survey Routes', () => {
  let testUser;
  let activeSurvey;
  let inactiveSurvey;
  let userAgent;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await argon2.hash('password123');
    testUser = await new User({
      username: 'testuser',
      password: hashedPassword,
      isAdmin: false
    }).save();

    // Create active survey
    activeSurvey = await new Survey({
      title: 'Active Test Survey',
      description: 'This is an active test survey',
      questions: [
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
            { text: 'Option A', value: 'option_1' },
            { text: 'Option B', value: 'option_2' },
            { text: 'Option C', value: 'option_3' }
          ]
        }
      ],
      createdBy: testUser._id,
      isActive: true
    }).save();

    // Create inactive survey
    inactiveSurvey = await new Survey({
      title: 'Inactive Test Survey',
      description: 'This is an inactive test survey',
      questions: [
        {
          text: 'Test Question',
          type: 'rating',
          order: 1,
          options: []
        }
      ],
      createdBy: testUser._id,
      isActive: false
    }).save();

    // Create authenticated agent
    userAgent = request.agent(app);
    await userAgent
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
  });

  describe('GET /survey', () => {
    test('should show list of active surveys', async () => {
      const response = await request(app).get('/survey');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Available Surveys');
      expect(response.text).toContain('Active Test Survey');
      expect(response.text).not.toContain('Inactive Test Survey');
    });

    test('should show empty state when no active surveys', async () => {
      await Survey.updateMany({}, { isActive: false });
      
      const response = await request(app).get('/survey');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('No surveys available');
    });
  });

  describe('GET /survey/:id', () => {
    test('should show active survey form', async () => {
      const response = await request(app).get(`/survey/${activeSurvey._id}`);
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Active Test Survey');
      expect(response.text).toContain('How satisfied are you?');
      expect(response.text).toContain('What is your preference?');
      expect(response.text).toContain('Option A');
    });

    test('should not show inactive survey', async () => {
      const response = await request(app).get(`/survey/${inactiveSurvey._id}`);
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('no longer accepting responses');
    });

    test('should return 404 for non-existent survey', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/survey/${nonExistentId}`);
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Survey not found');
    });
  });

  describe('POST /survey/:id/submit', () => {
    test('should submit survey response successfully', async () => {
      const responseData = {
        [`question_${activeSurvey.questions[0]._id}`]: '4',
        [`question_${activeSurvey.questions[1]._id}`]: 'option_2'
      };

      const response = await request(app)
        .post(`/survey/${activeSurvey._id}/submit`)
        .send(responseData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Thank You');
      expect(response.text).toContain('Active Test Survey');

      // Check if response was saved
      const savedResponse = await Response.findOne({ surveyId: activeSurvey._id });
      expect(savedResponse).toBeTruthy();
      expect(savedResponse.answers).toHaveLength(2);
    });

    test('should submit partial response (optional questions)', async () => {
      const responseData = {
        [`question_${activeSurvey.questions[0]._id}`]: '3'
        // Missing second question
      };

      const response = await request(app)
        .post(`/survey/${activeSurvey._id}/submit`)
        .send(responseData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Thank You');

      const savedResponse = await Response.findOne({ surveyId: activeSurvey._id });
      expect(savedResponse).toBeTruthy();
      expect(savedResponse.answers).toHaveLength(1);
    });

    test('should not submit to inactive survey', async () => {
      const responseData = {
        [`question_${inactiveSurvey.questions[0]._id}`]: '3'
      };

      const response = await request(app)
        .post(`/survey/${inactiveSurvey._id}/submit`)
        .send(responseData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Survey not available');
    });
  });

  describe('Feedback System', () => {
    test('should show feedback form', async () => {
      const response = await request(app)
        .get(`/survey/${activeSurvey._id}/feedback`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Share Your Feedback');
      expect(response.text).toContain('Active Test Survey');
    });

    test('should submit feedback successfully', async () => {
      const feedbackData = {
        comment: 'This survey was very well designed and easy to complete. The questions were clear and relevant.'
      };

      const response = await request(app)
        .post(`/survey/${activeSurvey._id}/feedback`)
        .send(feedbackData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Thank You');
      expect(response.text).toContain('feedback has been submitted');

      // Check if feedback was saved
      const savedFeedback = await Feedback.findOne({ surveyId: activeSurvey._id });
      expect(savedFeedback).toBeTruthy();
      expect(savedFeedback.comment).toBe(feedbackData.comment);
    });

    test('should not submit empty feedback', async () => {
      const feedbackData = {
        comment: ''
      };

      const response = await request(app)
        .post(`/survey/${activeSurvey._id}/feedback`)
        .send(feedbackData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Please provide your feedback');
    });

    test('should not submit feedback longer than 1000 characters', async () => {
      const longComment = 'a'.repeat(1001);
      const feedbackData = {
        comment: longComment
      };

      const response = await request(app)
        .post(`/survey/${activeSurvey._id}/feedback`)
        .send(feedbackData);

      expect(response.status).toBe(200);
      expect(response.text).toContain('must be less than 1000 characters');
    });

    test('should handle feedback for non-existent survey', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/survey/${nonExistentId}/feedback`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Survey not found');
    });
  });

  describe('Survey Analytics', () => {
    beforeEach(async () => {
      // Add some test responses
      const responses = [
        {
          surveyId: activeSurvey._id,
          answers: [
            { questionId: activeSurvey.questions[0]._id, answer: '4' },
            { questionId: activeSurvey.questions[1]._id, answer: 'option_1' }
          ]
        },
        {
          surveyId: activeSurvey._id,
          answers: [
            { questionId: activeSurvey.questions[0]._id, answer: '5' },
            { questionId: activeSurvey.questions[1]._id, answer: 'option_2' }
          ]
        },
        {
          surveyId: activeSurvey._id,
          answers: [
            { questionId: activeSurvey.questions[0]._id, answer: '3' },
            { questionId: activeSurvey.questions[1]._id, answer: 'option_1' }
          ]
        }
      ];

      await Response.insertMany(responses);

      // Add test feedback
      const feedback = [
        { surveyId: activeSurvey._id, comment: 'Great survey!' },
        { surveyId: activeSurvey._id, comment: 'Could be improved.' }
      ];

      await Feedback.insertMany(feedback);
    });

    test('should calculate response statistics correctly', async () => {
      const responses = await Response.find({ surveyId: activeSurvey._id });
      expect(responses).toHaveLength(3);

      // Check rating distribution
      const ratingAnswers = responses.map(r => 
        r.answers.find(a => a.questionId.toString() === activeSurvey.questions[0]._id.toString())
      ).filter(Boolean);

      const ratingDistribution = {};
      ratingAnswers.forEach(answer => {
        ratingDistribution[answer.answer] = (ratingDistribution[answer.answer] || 0) + 1;
      });

      expect(ratingDistribution['3']).toBe(1);
      expect(ratingDistribution['4']).toBe(1);
      expect(ratingDistribution['5']).toBe(1);
    });

    test('should handle surveys with no responses', async () => {
      const newSurvey = await new Survey({
        title: 'Empty Survey',
        questions: [{ text: 'Test', type: 'rating', order: 1, options: [] }],
        createdBy: testUser._id,
        isActive: true
      }).save();

      const responses = await Response.find({ surveyId: newSurvey._id });
      expect(responses).toHaveLength(0);
    });
  });
});