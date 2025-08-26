const express = require('express');
const Survey = require('../models/Survey');
const Response = require('../models/Response');

const router = express.Router();

// Middleware to check if user is authenticated and admin
const requireAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect('/auth/login');
  }
  next();
};

// Dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const surveys = await Survey.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    res.render('admin/dashboard', { surveys, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.render('admin/dashboard', { surveys: [], user: req.session.user });
  }
});

// Create survey form
router.get('/survey/new', requireAdmin, (req, res) => {
  res.render('admin/create-survey', { user: req.session.user });
});

// Create survey POST
router.post('/survey/new', requireAdmin, async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    const parsedQuestions = JSON.parse(questions);
    
    const survey = new Survey({
      title,
      description,
      questions: parsedQuestions,
      createdBy: req.session.user.id
    });

    await survey.save();
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.render('admin/create-survey', { 
      user: req.session.user,
      error: 'Failed to create survey'
    });
  }
});

// Survey results
router.get('/survey/:id/results', requireAdmin, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    const responses = await Response.find({ surveyId: req.params.id });
    
    if (!survey) {
      return res.render('error', { message: 'Survey not found' });
    }

    // Process results for visualization
    const results = {};
    survey.questions.forEach(question => {
      results[question._id] = {
        question: question.text,
        type: question.type,
        options: question.options,
        responses: {}
      };

      if (question.type === 'rating') {
        for (let i = 1; i <= 5; i++) {
          results[question._id].responses[i] = 0;
        }
      } else {
        question.options.forEach(option => {
          results[question._id].responses[option.value] = 0;
        });
      }
    });

    responses.forEach(response => {
      response.answers.forEach(answer => {
        if (results[answer.questionId]) {
          results[answer.questionId].responses[answer.answer]++;
        }
      });
    });

    res.render('admin/results', { 
      survey, 
      results, 
      totalResponses: responses.length,
      user: req.session.user 
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Failed to load survey results' });
  }
});

// Toggle survey active status
router.post('/survey/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    survey.isActive = !survey.isActive;
    await survey.save();
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;