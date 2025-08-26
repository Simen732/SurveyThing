# Survey Application

A professional survey application for workplace feedback collection built with Node.js, Express, MongoDB, and EJS.

## Features

- **Anonymous Surveys**: Completely anonymous response collection
- **Professional UI**: Clean, modern interface suitable for workplace use
- **Admin Dashboard**: Comprehensive management interface for administrators
- **Real-time Results**: Visual charts and statistics for survey responses
- **Secure Authentication**: Argon2 password hashing for admin accounts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dynamic Survey Creation**: Flexible survey builder with multiple question types

## Question Types Supported

- **Rating Scale**: 1-5 star ratings for satisfaction surveys
- **Multiple Choice**: Custom options for preference questions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and update with your MongoDB connection string
   - Change the session secret in production

4. Start MongoDB service

5. Run the application:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

### Initial Setup

1. Visit `/auth/register` to create an admin account
2. Login at `/auth/login` with admin credentials
3. Create your first survey from the admin dashboard
4. Share survey links with participants

## Project Structure

```
├── models/          # MongoDB schemas
├── routes/          # Express route handlers
├── views/           # EJS templates
├── public/          # Static assets (CSS, JS, images)
├── app.js           # Main application file
└── package.json     # Project dependencies
```

## Security Features

- **Anonymous Responses**: No user identification stored with survey responses
- **Secure Password Hashing**: Argon2 encryption for admin passwords
- **Session Management**: Secure session handling with MongoDB store
- **Input Validation**: Comprehensive form validation and sanitization

## Usage

### For Participants
1. Visit the application homepage
2. Click "View Available Surveys"
3. Select a survey to complete
4. Answer all questions and submit
5. View confirmation page

### For Administrators
1. Login with admin credentials
2. Access the admin dashboard
3. Create new surveys with custom questions
4. View real-time results and analytics
5. Manage survey status (active/inactive)

## API Endpoints

- `GET /` - Homepage
- `GET /survey` - List available surveys
- `GET /survey/:id` - Take specific survey
- `POST /survey/:id/submit` - Submit survey responses
- `GET /auth/login` - Admin login page
- `POST /auth/login` - Process admin login
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/survey/new` - Create survey form
- `POST /admin/survey/new` - Process survey creation
- `GET /admin/survey/:id/results` - View survey results

## Contributing

1. Follow the existing code style and structure
2. Test all functionality before submitting changes
3. Update documentation as needed

## License

This project is licensed under the MIT License.