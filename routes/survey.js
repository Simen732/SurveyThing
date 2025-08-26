const express = require('express');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const Feedback = require('../models/Feedback');

const router = express.Router();

// List all active surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.find({ isActive: true }).sort({ createdAt: -1 });
    res.render('survey/list', { 
      surveys,
      user: req.session?.user || null 
    });
  } catch (error) {
    console.error(error);
    res.render('survey/list', { 
      surveys: [],
      user: req.session?.user || null 
    });
  }
});

// Show survey form
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.render('error', { message: 'Survey not found' });
    }
    
    if (!survey.isActive) {
      return res.render('error', { message: 'This survey is no longer accepting responses' });
    }
    
    res.render('survey/form', { 
      survey,
      user: req.session?.user || null 
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Failed to load survey' });
  }
});

// Submit survey response
router.post('/:id/submit', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey || !survey.isActive) {
      return res.render('error', { message: 'Survey not available' });
    }

    const answers = [];
    survey.questions.forEach(question => {
      const answer = req.body[`question_${question._id}`];
      if (answer) {
        answers.push({
          questionId: question._id,
          answer: answer
        });
      }
    });

    const response = new Response({
      surveyId: req.params.id,
      answers: answers
    });

    await response.save();
    res.render('survey/success', { 
      surveyId: req.params.id,
      surveyTitle: survey.title 
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Failed to submit survey response' });
  }
});

// Feedback form
router.get('/:id/feedback', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.render('error', { message: 'Survey not found' });
    }
    
    res.render('survey/feedback', { 
      survey,
      user: req.session?.user || null 
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Failed to load feedback form' });
  }
});

// Submit feedback
router.post('/:id/feedback', async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment || comment.trim().length === 0) {
      const survey = await Survey.findById(req.params.id);
      return res.render('survey/feedback', { 
        survey, 
        user: req.session?.user || null,
        error: 'Please provide your feedback before submitting' 
      });
    }
    
    if (comment.length > 1000) {
      const survey = await Survey.findById(req.params.id);
      return res.render('survey/feedback', { 
        survey, 
        user: req.session?.user || null,
        error: 'Feedback must be less than 1000 characters' 
      });
    }
    
    const feedback = new Feedback({
      surveyId: req.params.id,
      comment: comment.trim()
    });
    
    await feedback.save();
    res.render('survey/feedback-success');
  } catch (error) {
    console.error(error);
    const survey = await Survey.findById(req.params.id);
    res.render('survey/feedback', { 
      survey, 
      user: req.session?.user || null,
      error: 'Failed to submit feedback. Please try again.' 
    });
  }
});

module.exports = router;