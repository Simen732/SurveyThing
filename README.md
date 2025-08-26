# Survey Application

A professional survey platform built with Node.js, Express, MongoDB, and Bootstrap. This application allows administrators to create and manage surveys while providing users with an intuitive interface to participate and provide feedback.

## 🚀 Features

### 👥 User Management
- **User Registration & Authentication** - Secure user accounts with password hashing
- **Admin System** - Role-based access control for administrators
- **Session Management** - Persistent login sessions with MongoDB store

### 📊 Survey Management
- **Survey Creation** - Rich survey builder with multiple question types
- **Question Types:**
  - ⭐ Rating Scale (1-5 numeric buttons)
  - 📝 Multiple Choice questions
- **Survey Status Control** - Activate/deactivate surveys
- **Survey Editing** - Full edit capabilities with response warnings
- **Survey Deletion** - Safe deletion (inactive surveys only)

### 📈 Analytics & Insights
- **Real-time Results** - Live analytics dashboard for survey responses
- **Visual Charts** - Interactive charts powered by Chart.js
- **Response Statistics** - Detailed breakdown of all answers
- **Export Capabilities** - Data visualization for decision making

### 💬 Feedback System
- **Survey Feedback** - Users can provide feedback on survey experience
- **Comment System** - Anonymous feedback collection (up to 1000 characters)
- **Admin Feedback Review** - Feedback displayed in admin results panel

### 🔒 Security Features
- **Password Hashing** - Argon2 encryption for secure password storage
- **Session Security** - Secure session management
- **Admin Protection** - Admin-only routes with authentication middleware
- **Input Validation** - Form validation and sanitization

### 🎨 User Experience
- **Responsive Design** - Bootstrap-based UI works on all devices
- **Professional Interface** - Clean, modern design
- **Intuitive Navigation** - Easy-to-use survey taking experience
- **Success Feedback** - Clear confirmation after survey submission

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Frontend:** EJS templating, Bootstrap 5, Font Awesome
- **Security:** Argon2 password hashing, Express Session
- **Charts:** Chart.js for data visualization

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd survey-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   SESSION_SECRET=your-super-secret-session-key
   PORT=3000
   ```

4. **Start the application:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Generate sample data (optional):**
   ```bash
   npm run generate-data
   ```

## 🚀 Usage

### For Users
1. **Visit the homepage** at `http://localhost:3000`
2. **Browse available surveys** - Click "View Available Surveys"
3. **Take a survey** - Complete questions and submit responses
4. **Provide feedback** - Optional feedback on survey experience

### For Administrators
1. **Register as admin** or use existing admin account
2. **Access admin dashboard** - Manage all surveys and view analytics
3. **Create surveys:**
   - Add title and description
   - Create questions (rating scale or multiple choice)
   - Activate survey for public access
4. **View results:**
   - Real-time response analytics
   - Interactive charts and statistics
   - User feedback comments
5. **Manage surveys:**
   - Edit existing surveys (with response warnings)
   - Activate/deactivate surveys
   - Delete inactive surveys

## 📁 Project Structure

```
survey-app/
├── models/
│   ├── User.js          # User model with authentication
│   ├── Survey.js        # Survey model with questions
│   ├── Response.js      # Survey response model
│   └── Feedback.js      # Survey feedback model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── admin.js         # Admin panel routes
│   └── survey.js        # Public survey routes
├── views/
│   ├── admin/           # Admin panel templates
│   ├── auth/            # Login/register templates
│   ├── survey/          # Survey taking templates
│   └── index.ejs        # Homepage template
├── public/
│   ├── js/              # Client-side JavaScript
│   └── css/             # Custom stylesheets
├── app.js               # Main application file
├── package.json         # Dependencies and scripts
└── .env                 # Environment configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/survey-app` |
| `SESSION_SECRET` | Secret key for session encryption | Required |
| `PORT` | Server port | `3000` |

### Database Setup

The application will automatically create the necessary collections:
- `users` - User accounts and admin status
- `surveys` - Survey definitions and questions
- `responses` - User survey responses
- `feedback` - Survey feedback comments

## 📊 API Endpoints

### Public Routes
- `GET /` - Homepage
- `GET /survey` - List active surveys
- `GET /survey/:id` - Display survey form
- `POST /survey/:id/submit` - Submit survey response
- `GET /survey/:id/feedback` - Feedback form
- `POST /survey/:id/feedback` - Submit feedback

### Authentication Routes
- `GET /auth/login` - Login page
- `POST /auth/login` - Process login
- `GET /auth/register` - Registration page
- `POST /auth/register` - Process registration
- `POST /auth/logout` - Logout user

### Admin Routes (Authentication Required)
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/survey/new` - Create survey form
- `POST /admin/survey/new` - Create new survey
- `GET /admin/survey/:id/results` - View survey results
- `GET /admin/survey/:id/edit` - Edit survey form
- `POST /admin/survey/:id/edit` - Update survey
- `POST /admin/survey/:id/toggle` - Activate/deactivate survey
- `POST /admin/survey/:id/delete` - Delete inactive survey

## 🎨 Customization

### Styling
- Bootstrap 5 for responsive design
- Font Awesome for icons
- Custom CSS in `/public/css/`
- Easy to theme with CSS variables

### Question Types
Currently supports:
- **Rating Scale:** 1-5 numeric buttons
- **Multiple Choice:** Radio button selections

Additional question types can be added by extending the survey model and form templates.

## 🚀 Deployment

### Heroku Deployment
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Connect to MongoDB Atlas for production database
4. Deploy using Git or GitHub integration

### Environment Setup for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/survey-app
SESSION_SECRET=your-production-secret-key
PORT=process.env.PORT
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation above
- Review the code comments
- Create an issue in the repository

## 🎯 Future Enhancements

- **Additional Question Types:** Text input, checkboxes, date pickers
- **Survey Templates:** Pre-built survey templates for common use cases
- **Advanced Analytics:** More detailed reporting and export options
- **Email Notifications:** Automated survey invitations
- **Survey Scheduling:** Time-based survey activation
- **Multi-language Support:** Internationalization capabilities
- **API Integration:** RESTful API for external integrations
- **Advanced Security:** Two-factor authentication, rate limiting

---

**Built with ❤️ using Node.js and MongoDB**