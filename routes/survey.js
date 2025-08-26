const express = require('express');
const Survey = require('../models/Survey');
const Response = require('../models/Response');

const router = express.Router();

// List active surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.find({ isActive: true }).sort({ createdAt: -1 });
    res.render('survey/list', { surveys });
  } catch (error) {
    console.error(error);
    res.render('survey/list', { surveys: [] });
  }
});

// Take survey
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey || !survey.isActive) {
      return res.render('error', { message: 'Survey not found or no longer active' });
    }
    
    res.render('survey/take', { survey });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Survey not found' });
  }
});

// Submit survey response
router.post('/:id/submit', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey || !survey.isActive) {
      return res.status(404).json({ error: 'Survey not found or no longer active' });
    }

    const answers = [];
    for (const question of survey.questions) {
      const answer = req.body[`question_${question._id}`];
      if (answer !== undefined) {
        answers.push({
          questionId: question._id,
          answer: answer
        });
      }
    }

    const response = new Response({
      surveyId: survey._id,
      answers
    });

    await response.save();
    res.render('survey/success', { surveyTitle: survey.title });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

module.exports = router;