const express = require('express');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const Feedback = require('../models/Feedback');

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
    const feedback = await Feedback.find({ surveyId: req.params.id }).sort({ submittedAt: -1 });
    
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
      feedback,
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

// Edit survey form
router.get('/survey/:id/edit', requireAdmin, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.render('error', { message: 'Survey not found' });
    }

    // Check if survey has responses
    const responseCount = await Response.countDocuments({ surveyId: survey._id });
    
    res.render('admin/edit-survey', { 
      survey, 
      responseCount, 
      user: req.session.user 
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Failed to load survey for editing' });
  }
});

// Update survey POST
router.post('/survey/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    if (!title || !questions) {
      return res.render('admin/edit-survey', { 
        survey: await Survey.findById(req.params.id),
        responseCount: await Response.countDocuments({ surveyId: req.params.id }),
        user: req.session.user,
        error: 'Title and questions are required'
      });
    }

    const parsedQuestions = JSON.parse(questions);
    
    const survey = await Survey.findByIdAndUpdate(req.params.id, {
      title,
      description,
      questions: parsedQuestions,
      updatedAt: new Date()
    }, { new: true });

    if (!survey) {
      return res.render('error', { message: 'Survey not found' });
    }

    res.render('admin/edit-success', { 
      survey,
      user: req.session.user 
    });
  } catch (error) {
    console.error(error);
    try {
      const survey = await Survey.findById(req.params.id);
      const responseCount = await Response.countDocuments({ surveyId: req.params.id });
      res.render('admin/edit-survey', { 
        survey,
        responseCount,
        user: req.session.user,
        error: 'Failed to update survey. Please check your input and try again.'
      });
    } catch (err) {
      res.render('error', { message: 'Failed to update survey' });
    }
  }
});

// Delete survey (only inactive surveys)
router.post('/survey/:id/delete', requireAdmin, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.redirect('/admin/dashboard');
    }

    // Check if survey is active - only allow deletion of inactive surveys
    if (survey.isActive) {
      return res.render('error', { 
        message: 'Cannot delete active surveys. Please deactivate the survey first.' 
      });
    }

    // Delete all responses associated with this survey
    await Response.deleteMany({ surveyId: survey._id });
    
    // Delete the survey
    await Survey.findByIdAndDelete(req.params.id);
    
    console.log(`Survey "${survey.title}" and all associated responses deleted by admin: ${req.session.user.username}`);
    
    // Redirect to dashboard with success message
    res.redirect('/admin/dashboard?deleted=true');
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.render('error', { 
      message: 'Failed to delete survey. Please try again.' 
    });
  }
});

module.exports = router;