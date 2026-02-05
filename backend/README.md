# DexterHub LMS - Backend Server

A standalone Express.js backend server for the DexterHub Learning Management System with MongoDB database.

## Features

- ✅ **RESTful API** with organized routes
- ✅ **MVC Architecture** (Models, Views, Controllers)
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **Role-Based Access Control** (Learner, Instructor, Admin, Super Admin)
- ✅ **MongoDB Integration** with Mongoose ODM
- ✅ **Error Handling** middleware
- ✅ **CORS** enabled for frontend integration

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Cohort.js
│   │   ├── Course.js
│   │   ├── Module.js
│   │   ├── Lesson.js
│   │   ├── LearnerProgress.js
│   │   ├── InstructorNote.js
│   │   ├── DropRecommendation.js
│   │   ├── GracePeriod.js
│   │   ├── Appeal.js
│   │   └── AuditLog.js
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── cohortController.js
│   │   ├── learnerController.js
│   │   ├── instructorController.js
│   │   └── adminController.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── cohorts.js
│   │   ├── learners.js
│   │   ├── instructors.js
│   │   └── admin.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   └── errorHandler.js
│   ├── utils/                   # Helper functions
│   └── server.js                # Main Express app
├── package.json
├── .env
└── .gitignore
```

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dexterhub-lms
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   PORT=5000
   ```

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Cohorts
- `GET /api/cohorts` - Get all cohorts (authenticated)
- `GET /api/cohorts/:id` - Get cohort by ID (authenticated)
- `POST /api/cohorts` - Create cohort (admin only)
- `GET /api/cohorts/:cohortId/learners` - Get cohort learners (authenticated)

### Learner Progress
- `GET /api/learner-progress/:learnerId` - Get learner progress (authenticated)
- `PUT /api/learner-progress/:id` - Update progress (authenticated)

### Instructor
- `POST /api/instructors/notes` - Create instructor note (instructor/admin)
- `POST /api/instructors/drop-recommendations` - Submit drop recommendation (instructor)

### Admin
- `GET /api/admin/drop-recommendations` - Get pending recommendations (admin)
- `PUT /api/admin/drop-recommendations/:id` - Review recommendation (admin)
- `POST /api/admin/grace-periods` - Grant grace period (admin)
- `GET /api/admin/appeals` - Get pending appeals (admin)
- `PUT /api/admin/appeals/:id` - Review appeal (admin)
- `POST /api/admin/appeals` - Submit appeal (learner)
- `GET /api/admin/audit-logs` - Get audit logs (admin)

### Health Check
- `GET /health` - Server health status

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access

- **Learner**: Access to own progress and courses
- **Instructor**: Can manage assigned cohorts and submit recommendations
- **Admin**: Full system management except audit logs
- **Super Admin**: Complete system access including audit logs

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start
```

## Database Schema

The server uses MongoDB with the following main collections:
- `users` - User accounts and authentication
- `cohorts` - Training cohorts
- `courses` - Course content
- `modules` - Course modules
- `lessons` - Individual lessons
- `learnerprogresses` - Student progress tracking
- `instructornotes` - Instructor feedback
- `droprecommendations` - Drop recommendations
- `graceperiods` - Grace period grants
- `appeals` - Student appeals
- `auditlogs` - System activity logs

## Error Handling

The server includes comprehensive error handling:
- Invalid requests return appropriate HTTP status codes
- Detailed error messages in development mode
- Sanitized errors in production mode

## Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Role-based authorization
- ✅ CORS configuration
- ✅ Input validation
- ✅ Protected routes

## Deployment

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dexterhub-lms
JWT_SECRET=your-production-secret-key
NODE_ENV=production
PORT=5000
```

### Deploy to Railway/Heroku/AWS
1. Push code to Git repository
2. Connect to deployment platform
3. Set environment variables
4. Deploy!

## License

MIT
