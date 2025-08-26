const User = require('../models/User');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const Feedback = require('../models/Feedback');
const argon2 = require('argon2');
const mongoose = require('mongoose');

describe('Database Models', () => {
  describe('User Model', () => {
    test('should create a user with valid data', async () => {
      const hashedPassword = await argon2.hash('testpassword');
      const user = new User({
        username: 'testuser',
        password: hashedPassword,
        isAdmin: false
      });

      const savedUser = await user.save();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe('testuser');
      expect(savedUser.isAdmin).toBe(false);
      expect(savedUser.createdAt).toBeDefined();
    });

    test('should not create user without required fields', async () => {
      const user = new User({
        username: 'testuser'
        // Missing password
      });

      await expect(user.save()).rejects.toThrow();
    });

    test('should not create user with duplicate username', async () => {
      const hashedPassword = await argon2.hash('testpassword');
      
      const user1 = new User({
        username: 'duplicate',
        password: hashedPassword
      });
      await user1.save();

      const user2 = new User({
        username: 'duplicate',
        password: hashedPassword
      });

      await expect(user2.save()).rejects.toThrow();
    });

    test('should default isAdmin to false', async () => {
      const hashedPassword = await argon2.hash('testpassword');
      const user = new User({
        username: 'testuser',
        password: hashedPassword
      });

      const savedUser = await user.save();
      expect(savedUser.isAdmin).toBe(false);
    });
  });

  describe('Survey Model', () => {
    let testUser;

    beforeEach(async () => {
      const hashedPassword = await argon2.hash('password123');
      testUser = await new User({
        username: 'testuser',
        password: hashedPassword
      }).save();
    });

    test('should create survey with valid data', async () => {
      const survey = new Survey({
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
        createdBy: testUser._id
      });

      const savedSurvey = await survey.save();
      expect(savedSurvey._id).toBeDefined();
      expect(savedSurvey.title).toBe('Test Survey');
      expect(savedSurvey.isActive).toBe(true); // Default value
      expect(savedSurvey.questions).toHaveLength(1);
      expect(savedSurvey.createdAt).toBeDefined();
    });

    test('should not create survey without required fields', async () => {
      const survey = new Survey({
        description: 'Test Description'
        // Missing title and createdBy
      });

      await expect(survey.save()).rejects.toThrow();
    });

    test('should validate question types', async () => {
      const survey = new Survey({
        title: 'Test Survey',
        questions: [
          {
            text: 'Test Question',
            type: 'invalid-type', // Invalid type
            order: 1,
            options: []
          }
        ],
        createdBy: testUser._id
      });

      await expect(survey.save()).rejects.toThrow();
    });

    test('should populate createdBy field', async () => {
      const survey = new Survey({
        title: 'Test Survey',
        questions: [
          {
            text: 'Test Question',
            type: 'rating',
            order: 1,
            options: []
          }
        ],
        createdBy: testUser._id
      });

      await survey.save();
      
      const populatedSurvey = await Survey.findById(survey._id)
        .populate('createdBy', 'username');
      
      expect(populatedSurvey.createdBy.username).toBe('testuser');
    });
  });

  describe('Response Model', () => {
    let testSurvey;

    beforeEach(async () => {
      const hashedPassword = await argon2.hash('password123');
      const testUser = await new User({
        username: 'testuser',
        password: hashedPassword
      }).save();

      testSurvey = await new Survey({
        title: 'Test Survey',
        questions: [
          {
            text: 'Test Question',
            type: 'rating',
            order: 1,
            options: []
          }
        ],
        createdBy: testUser._id
      }).save();
    });

    test('should create response with valid data', async () => {
      const response = new Response({
        surveyId: testSurvey._id,
        answers: [
          {
            questionId: testSurvey.questions[0]._id,
            answer: '4'
          }
        ]
      });

      const savedResponse = await response.save();
      expect(savedResponse._id).toBeDefined();
      expect(savedResponse.surveyId.toString()).toBe(testSurvey._id.toString());
      expect(savedResponse.answers).toHaveLength(1);
      expect(savedResponse.submittedAt).toBeDefined();
    });

    test('should not create response without required fields', async () => {
      const response = new Response({
        answers: [] // Missing surveyId
      });

      await expect(response.save()).rejects.toThrow();
    });

    test('should allow empty answers array', async () => {
      const response = new Response({
        surveyId: testSurvey._id,
        answers: []
      });

      const savedResponse = await response.save();
      expect(savedResponse.answers).toHaveLength(0);
    });
  });

  describe('Feedback Model', () => {
    let testSurvey;

    beforeEach(async () => {
      const hashedPassword = await argon2.hash('password123');
      const testUser = await new User({
        username: 'testuser',
        password: hashedPassword
      }).save();

      testSurvey = await new Survey({
        title: 'Test Survey',
        questions: [
          {
            text: 'Test Question',
            type: 'rating',
            order: 1,
            options: []
          }
        ],
        createdBy: testUser._id
      }).save();
    });

    test('should create feedback with valid data', async () => {
      const feedback = new Feedback({
        surveyId: testSurvey._id,
        comment: 'This is a great survey!'
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.surveyId.toString()).toBe(testSurvey._id.toString());
      expect(savedFeedback.comment).toBe('This is a great survey!');
      expect(savedFeedback.submittedAt).toBeDefined();
    });

    test('should not create feedback without required fields', async () => {
      const feedback = new Feedback({
        surveyId: testSurvey._id
        // Missing comment
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    test('should enforce comment length limit', async () => {
      const longComment = 'a'.repeat(1001);
      const feedback = new Feedback({
        surveyId: testSurvey._id,
        comment: longComment
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    test('should allow comments up to 1000 characters', async () => {
      const maxComment = 'a'.repeat(1000);
      const feedback = new Feedback({
        surveyId: testSurvey._id,
        comment: maxComment
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.comment.length).toBe(1000);
    });
  });
});