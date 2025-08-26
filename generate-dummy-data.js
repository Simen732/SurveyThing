const mongoose = require('mongoose');
const argon2 = require('argon2');
require('dotenv').config();

const User = require('./models/User');
const Survey = require('./models/Survey');
const Response = require('./models/Response');

// Survey data templates
const surveyTemplates = [
  {
    title: "Employee Satisfaction Survey",
    description: "Help us understand your workplace experience and satisfaction levels",
    questions: [
      { text: "How satisfied are you with your current role?", type: "rating" },
      { text: "How would you rate work-life balance at our company?", type: "rating" },
      { text: "Which benefit is most important to you?", type: "multiple-choice", options: ["Health Insurance", "Flexible Hours", "Remote Work", "Professional Development", "Paid Time Off"] },
      { text: "How satisfied are you with your direct supervisor?", type: "rating" },
      { text: "Rate the company's communication transparency", type: "rating" },
      { text: "Which area needs the most improvement?", type: "multiple-choice", options: ["Communication", "Technology", "Workspace", "Benefits", "Training"] },
      { text: "How likely are you to recommend this company as a workplace?", type: "rating" },
      { text: "Rate your satisfaction with professional development opportunities", type: "rating" },
      { text: "What motivates you most at work?", type: "multiple-choice", options: ["Recognition", "Career Growth", "Salary", "Team Collaboration", "Interesting Projects"] },
      { text: "How satisfied are you with the company culture?", type: "rating" },
      { text: "Rate the effectiveness of team meetings", type: "rating" },
      { text: "Which communication tool do you prefer?", type: "multiple-choice", options: ["Email", "Slack/Teams", "In-Person", "Phone Calls", "Video Calls"] }
    ]
  },
  {
    title: "Remote Work Experience Survey",
    description: "Share your thoughts on remote work policies and experiences",
    questions: [
      { text: "How productive do you feel working from home?", type: "rating" },
      { text: "Rate your satisfaction with current remote work tools", type: "rating" },
      { text: "What's your biggest challenge with remote work?", type: "multiple-choice", options: ["Internet Connection", "Distractions", "Isolation", "Communication", "Time Management"] },
      { text: "How often would you like to work from the office?", type: "multiple-choice", options: ["Never", "1 day/week", "2-3 days/week", "Full time", "As needed"] },
      { text: "Rate your work-life balance while remote", type: "rating" },
      { text: "How satisfied are you with virtual team collaboration?", type: "rating" },
      { text: "Which remote work benefit do you value most?", type: "multiple-choice", options: ["No Commute", "Flexible Schedule", "Comfortable Environment", "Cost Savings", "Better Focus"] },
      { text: "Rate the quality of virtual meetings", type: "rating" },
      { text: "How well does your home office setup work for you?", type: "rating" },
      { text: "What would improve your remote work experience?", type: "multiple-choice", options: ["Better Equipment", "More Social Interaction", "Clearer Expectations", "Training", "Ergonomic Support"] },
      { text: "Rate your overall remote work satisfaction", type: "rating" }
    ]
  },
  {
    title: "Customer Service Feedback",
    description: "Help us improve our customer service experience",
    questions: [
      { text: "How would you rate your overall experience with our customer service?", type: "rating" },
      { text: "How quickly was your issue resolved?", type: "multiple-choice", options: ["Immediately", "Same Day", "Within 2-3 Days", "Within a Week", "Still Unresolved"] },
      { text: "Rate the friendliness of our support staff", type: "rating" },
      { text: "Which contact method do you prefer?", type: "multiple-choice", options: ["Phone", "Email", "Live Chat", "Social Media", "In-Person"] },
      { text: "How clear were the explanations provided?", type: "rating" },
      { text: "Rate the knowledge level of the support representative", type: "rating" },
      { text: "How likely are you to contact us again for support?", type: "rating" },
      { text: "What time of day do you prefer to receive support?", type: "multiple-choice", options: ["Morning (8-12)", "Afternoon (12-5)", "Evening (5-8)", "Anytime", "Weekend"] },
      { text: "Rate your satisfaction with our response time", type: "rating" },
      { text: "How would you rate our follow-up communication?", type: "rating" },
      { text: "Which improvement would help you most?", type: "multiple-choice", options: ["Faster Response", "More Knowledgeable Staff", "Better Tools", "Extended Hours", "Self-Service Options"] },
      { text: "Rate the ease of reaching customer support", type: "rating" },
      { text: "How likely are you to recommend our service to others?", type: "rating" }
    ]
  },
  {
    title: "Product Feedback Survey",
    description: "Share your experience with our latest product release",
    questions: [
      { text: "How satisfied are you with the product overall?", type: "rating" },
      { text: "Rate the ease of use", type: "rating" },
      { text: "Which feature do you use most often?", type: "multiple-choice", options: ["Dashboard", "Reporting", "Analytics", "Integration", "Mobile App"] },
      { text: "How would you rate the product's performance?", type: "rating" },
      { text: "Rate the visual design and user interface", type: "rating" },
      { text: "What's the primary reason you chose this product?", type: "multiple-choice", options: ["Price", "Features", "Reputation", "Recommendation", "Trial Experience"] },
      { text: "How satisfied are you with the documentation?", type: "rating" },
      { text: "Rate the onboarding process", type: "rating" },
      { text: "Which feature would you like to see improved?", type: "multiple-choice", options: ["Speed", "User Interface", "Mobile Experience", "Integrations", "Reporting"] },
      { text: "How likely are you to upgrade to premium features?", type: "rating" },
      { text: "Rate your satisfaction with product updates", type: "rating" },
      { text: "How does this product compare to alternatives?", type: "multiple-choice", options: ["Much Better", "Slightly Better", "About the Same", "Slightly Worse", "Much Worse"] }
    ]
  },
  {
    title: "Training Program Evaluation",
    description: "Evaluate the effectiveness of our recent training program",
    questions: [
      { text: "How would you rate the overall quality of the training?", type: "rating" },
      { text: "Rate the relevance of the content to your job", type: "rating" },
      { text: "Which training format do you prefer?", type: "multiple-choice", options: ["In-Person Classroom", "Virtual Live Sessions", "Self-Paced Online", "Video Tutorials", "Hands-On Workshops"] },
      { text: "How engaging was the training material?", type: "rating" },
      { text: "Rate the knowledge level of the instructor", type: "rating" },
      { text: "How confident do you feel applying what you learned?", type: "rating" },
      { text: "What was the most valuable part of the training?", type: "multiple-choice", options: ["Theoretical Knowledge", "Practical Exercises", "Group Discussions", "Case Studies", "Q&A Sessions"] },
      { text: "Rate the pace of the training", type: "multiple-choice", options: ["Too Fast", "Slightly Fast", "Just Right", "Slightly Slow", "Too Slow"] },
      { text: "How satisfied are you with the training materials provided?", type: "rating" },
      { text: "Rate the duration of the training program", type: "multiple-choice", options: ["Too Short", "Slightly Short", "Just Right", "Slightly Long", "Too Long"] },
      { text: "How likely are you to attend future training sessions?", type: "rating" },
      { text: "What type of follow-up support would be most helpful?", type: "multiple-choice", options: ["Refresher Sessions", "Practice Materials", "Mentoring", "Online Resources", "Peer Groups"] },
      { text: "Rate your overall satisfaction with the training experience", type: "rating" }
    ]
  },
  {
    title: "Office Environment Survey",
    description: "Help us create a better workplace environment for everyone",
    questions: [
      { text: "How satisfied are you with your workspace?", type: "rating" },
      { text: "Rate the comfort of your seating arrangement", type: "rating" },
      { text: "Which aspect of the office environment needs improvement?", type: "multiple-choice", options: ["Lighting", "Temperature", "Noise Level", "Air Quality", "Cleanliness"] },
      { text: "How would you rate the available meeting spaces?", type: "rating" },
      { text: "Rate the quality of office equipment and technology", type: "rating" },
      { text: "Which office amenity do you value most?", type: "multiple-choice", options: ["Kitchen/Break Room", "Parking", "Gym/Wellness", "Quiet Zones", "Collaboration Spaces"] },
      { text: "How satisfied are you with the office location?", type: "rating" },
      { text: "Rate the accessibility of the office building", type: "rating" },
      { text: "How would you improve the break room facilities?", type: "multiple-choice", options: ["Better Seating", "More Appliances", "Healthy Snacks", "Larger Space", "Entertainment Options"] },
      { text: "Rate your satisfaction with office security", type: "rating" },
      { text: "How well does the office layout support your work?", type: "rating" },
      { text: "Which workspace style do you prefer?", type: "multiple-choice", options: ["Private Office", "Shared Office", "Open Plan", "Hot Desking", "Hybrid Spaces"] },
      { text: "Rate the overall atmosphere of the workplace", type: "rating" }
    ]
  },
  {
    title: "Team Collaboration Assessment",
    description: "Evaluate how well our team works together and communicates",
    questions: [
      { text: "How effectively does your team communicate?", type: "rating" },
      { text: "Rate the level of trust within your team", type: "rating" },
      { text: "Which collaboration tool is most effective for your team?", type: "multiple-choice", options: ["Email", "Slack/Teams", "Project Management Tools", "Video Conferencing", "Shared Documents"] },
      { text: "How satisfied are you with team decision-making processes?", type: "rating" },
      { text: "Rate how well conflicts are resolved in your team", type: "rating" },
      { text: "What hinders effective collaboration most?", type: "multiple-choice", options: ["Poor Communication", "Unclear Roles", "Time Zones", "Technology Issues", "Personality Conflicts"] },
      { text: "How would you rate team meetings' effectiveness?", type: "rating" },
      { text: "Rate your team's ability to meet deadlines", type: "rating" },
      { text: "Which team building activity would be most valuable?", type: "multiple-choice", options: ["Team Outings", "Skills Workshops", "Problem-Solving Games", "Social Events", "Volunteer Activities"] },
      { text: "How well does your team share knowledge and expertise?", type: "rating" },
      { text: "Rate the diversity and inclusion within your team", type: "rating" },
      { text: "How satisfied are you with your role clarity within the team?", type: "rating" },
      { text: "What would most improve team collaboration?", type: "multiple-choice", options: ["Better Communication Tools", "Clear Processes", "More Face Time", "Skill Development", "Leadership Training"] }
    ]
  },
  {
    title: "Technology Usage Survey",
    description: "Help us understand your technology needs and preferences",
    questions: [
      { text: "How satisfied are you with your current computer/laptop?", type: "rating" },
      { text: "Rate the reliability of our internet connection", type: "rating" },
      { text: "Which software do you use most frequently?", type: "multiple-choice", options: ["Microsoft Office", "Google Workspace", "Project Management", "Design Tools", "Communication Apps"] },
      { text: "How would you rate our IT support response time?", type: "rating" },
      { text: "Rate your satisfaction with mobile device policies", type: "rating" },
      { text: "Which technology upgrade would help you most?", type: "multiple-choice", options: ["Faster Computer", "Better Monitor", "Improved Software", "Mobile Equipment", "Network Speed"] },
      { text: "How comfortable are you with new technology adoption?", type: "rating" },
      { text: "Rate the effectiveness of our cybersecurity measures", type: "rating" },
      { text: "Which training would be most valuable?", type: "multiple-choice", options: ["New Software", "Security Best Practices", "Productivity Tools", "Cloud Services", "Mobile Apps"] },
      { text: "How satisfied are you with cloud storage solutions?", type: "rating" },
      { text: "Rate the user-friendliness of our internal systems", type: "rating" },
      { text: "How often do you experience technical difficulties?", type: "multiple-choice", options: ["Never", "Rarely", "Sometimes", "Often", "Daily"] },
      { text: "Rate your overall satisfaction with workplace technology", type: "rating" }
    ]
  },
  {
    title: "Wellness and Work-Life Balance",
    description: "Share your thoughts on wellness programs and work-life balance",
    questions: [
      { text: "How would you rate your current work-life balance?", type: "rating" },
      { text: "Rate your stress level at work", type: "rating" },
      { text: "Which wellness program would interest you most?", type: "multiple-choice", options: ["Fitness Classes", "Mental Health Support", "Nutrition Counseling", "Meditation/Mindfulness", "Health Screenings"] },
      { text: "How satisfied are you with flexible work arrangements?", type: "rating" },
      { text: "Rate the company's support for mental health", type: "rating" },
      { text: "What time do you prefer to start work?", type: "multiple-choice", options: ["7:00-8:00 AM", "8:00-9:00 AM", "9:00-10:00 AM", "10:00-11:00 AM", "Flexible"] },
      { text: "How often do you take your full lunch break?", type: "multiple-choice", options: ["Always", "Usually", "Sometimes", "Rarely", "Never"] },
      { text: "Rate your satisfaction with vacation/PTO policies", type: "rating" },
      { text: "How supported do you feel when dealing with personal issues?", type: "rating" },
      { text: "Which benefit would improve your well-being most?", type: "multiple-choice", options: ["More PTO", "Flexible Hours", "Wellness Stipend", "Mental Health Days", "Ergonomic Support"] },
      { text: "How often do you feel overwhelmed at work?", type: "multiple-choice", options: ["Never", "Rarely", "Sometimes", "Often", "Always"] },
      { text: "Rate the company's recognition of work-life balance importance", type: "rating" }
    ]
  },
  {
    title: "Leadership and Management Feedback",
    description: "Provide feedback on leadership effectiveness and management practices",
    questions: [
      { text: "How effectively does senior leadership communicate company vision?", type: "rating" },
      { text: "Rate your direct manager's leadership effectiveness", type: "rating" },
      { text: "Which leadership quality is most important to you?", type: "multiple-choice", options: ["Clear Communication", "Fairness", "Vision", "Supportiveness", "Decision-Making"] },
      { text: "How satisfied are you with feedback frequency from your manager?", type: "rating" },
      { text: "Rate the transparency of company decision-making", type: "rating" },
      { text: "How well does leadership handle change management?", type: "rating" },
      { text: "What type of recognition motivates you most?", type: "multiple-choice", options: ["Public Recognition", "Private Praise", "Monetary Rewards", "Career Advancement", "Additional Responsibilities"] },
      { text: "Rate your manager's availability when you need support", type: "rating" },
      { text: "How satisfied are you with performance review processes?", type: "rating" },
      { text: "Which area of leadership needs the most improvement?", type: "multiple-choice", options: ["Communication", "Strategic Planning", "People Development", "Change Management", "Accountability"] },
      { text: "How well does leadership support professional development?", type: "rating" },
      { text: "Rate your confidence in the company's direction under current leadership", type: "rating" },
      { text: "How likely are you to approach senior leadership with concerns?", type: "rating" },
      { text: "Rate the effectiveness of company-wide communications", type: "rating" }
    ]
  }
];

async function createDummySurveys() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/survey-app');
    console.log('Connected to MongoDB');

    // Check if admin user exists, create if not
    let adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('Creating admin user...');
      const hashedPassword = await argon2.hash('admin123');
      adminUser = new User({
        username: 'admin',
        password: hashedPassword,
        isAdmin: true
      });
      await adminUser.save();
      console.log('Admin user created (username: admin, password: admin123)');
    }

    // Clear existing surveys
    await Survey.deleteMany({});
    await Response.deleteMany({});
    console.log('Cleared existing surveys and responses');

    // Create surveys
    const surveys = [];
    for (let i = 0; i < surveyTemplates.length; i++) {
      const template = surveyTemplates[i];
      
      const questions = template.questions.map((q, index) => {
        const question = {
          text: q.text,
          type: q.type,
          order: index + 1,
          options: []
        };

        if (q.type === 'multiple-choice' && q.options) {
          question.options = q.options.map((opt, optIndex) => ({
            text: opt,
            value: `option_${optIndex + 1}`
          }));
        }

        return question;
      });

      const survey = new Survey({
        title: template.title,
        description: template.description,
        questions: questions,
        isActive: Math.random() > 0.2, // 80% chance of being active
        createdBy: adminUser._id
      });

      surveys.push(survey);
    }

    await Survey.insertMany(surveys);
    console.log(`Created ${surveys.length} dummy surveys`);

    // Generate dummy responses for some surveys
    console.log('Generating dummy responses...');
    const activeSurveys = surveys.filter(s => s.isActive);
    
    for (const survey of activeSurveys) {
      const numResponses = Math.floor(Math.random() * 50) + 10; // 10-60 responses per survey
      
      for (let i = 0; i < numResponses; i++) {
        const answers = [];
        
        survey.questions.forEach(question => {
          let answer;
          if (question.type === 'rating') {
            // Generate realistic rating distribution (tend toward higher ratings)
            const ratings = [1, 2, 3, 4, 5];
            const weights = [0.05, 0.1, 0.2, 0.35, 0.3]; // Higher ratings more likely
            const random = Math.random();
            let cumulative = 0;
            for (let j = 0; j < ratings.length; j++) {
              cumulative += weights[j];
              if (random <= cumulative) {
                answer = ratings[j].toString();
                break;
              }
            }
          } else if (question.type === 'multiple-choice') {
            // Random selection from available options
            const randomIndex = Math.floor(Math.random() * question.options.length);
            answer = question.options[randomIndex].value;
          }

          if (answer) {
            answers.push({
              questionId: question._id,
              answer: answer
            });
          }
        });

        const response = new Response({
          surveyId: survey._id,
          answers: answers
        });

        await response.save();
      }
    }

    console.log('Dummy responses generated successfully');
    console.log('\n=== SETUP COMPLETE ===');
    console.log('Admin Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log(`\nCreated ${surveys.length} surveys with dummy data`);
    console.log('You can now start the application with: npm start');

  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createDummySurveys();