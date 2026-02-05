# DexterHub LMS - Setup & Installation Guide

A production-ready cohort-based Learning Management System built with modern tech stack.

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **State Management**: React Context + SWR
- **Charts**: Recharts
- **Styling**: Modern design with primary indigo/purple theme

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful endpoints with role-based access control

## Features Implemented

### 1. Authentication System
- User registration with email/password
- Secure JWT-based authentication
- Role-based access control (Learner, Instructor, Admin, Super Admin)
- Protected routes with middleware

### 2. Learner Dashboard
- **Dashboard**: Overview with cohort info, progress metrics, and status alerts
- **My Courses**: Track courses with progress bars and completion status
- **My Progress**: Performance trends, learning hours, assessments, and analytics
- **Real-time status**: On-track, At-risk, Under Review, Dropped

### 3. Instructor Dashboard
- **My Cohorts**: View assigned cohorts with learner statistics
- **Learner Management**: Search, filter, and monitor learner performance
- **Intervention Tools**: Add instructional notes and submit drop recommendations
- **At-risk Detection**: Automatic flagging of underperforming learners

### 4. Admin Dashboard
- **Dashboard**: Quick stats on cohorts, learners, and pending reviews
- **Cohorts Management**: Create, edit, and manage cohort settings
- **Learner Management**: System-wide learner oversight with filtering
- **Reviews & Appeals**: Process drop recommendations and learner appeals
- **Audit Logs** (Super Admin): Complete system activity tracking

### 5. Cohort Management
- Named cohorts with start/end dates
- Performance targets and weekly learning hour requirements
- Grace period configuration
- Learner and instructor assignment
- Status tracking (Upcoming, Active, Completed, Archived)

### 6. Performance Tracking
- Real-time score calculation
- Weekly learning hour tracking
- Inactivity monitoring
- Assessment management
- Performance comparison against cohort targets

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- MongoDB 5.x or higher (local or MongoDB Atlas)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (if using separate node_modules)
npm install --save express mongoose bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000

# Backend
MONGODB_URI=mongodb://localhost:27017/dexterhub-lms
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dexterhub-lms?retryWrites=true&w=majority
```

### 3. Database Setup

The MongoDB schemas are automatically created when the backend server starts. No additional migration scripts needed.

### 4. Run the Application

**Option 1: Separate Terminal Windows**

Terminal 1 - Start Backend:
```bash
npm run server:dev
```
This will start the Express server on `http://localhost:5000`

Terminal 2 - Start Frontend:
```bash
npm run dev
```
This will start the Next.js dev server on `http://localhost:3000`

**Option 2: Using Concurrently (Optional)**

Add to package.json scripts:
```json
"scripts": {
  "dev:all": "concurrently \"npm run server:dev\" \"npm run dev\""
}
```

Then:
```bash
npm run dev:all
```

## Demo Credentials

### Default Test Accounts

**Learner:**
- Email: `demo@example.com`
- Password: `demo123456`
- Role: Learner

Create additional accounts through the registration page.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with credentials

### Cohorts
- `GET /api/cohorts` - Get all cohorts
- `POST /api/cohorts` - Create new cohort (Admin)
- `GET /api/cohorts/:id` - Get cohort details
- `GET /api/cohorts/:cohortId/learners` - Get cohort learners

### Learner Progress
- `GET /api/learner-progress/:learnerId` - Get learner progress
- `PUT /api/learner-progress/:id` - Update progress

### Instructor Management
- `POST /api/instructor-notes` - Add note about learner
- `POST /api/drop-recommendations` - Submit drop recommendation

### Admin Operations
- `GET /api/drop-recommendations` - Get pending recommendations
- `PUT /api/drop-recommendations/:id` - Approve/reject recommendation
- `POST /api/grace-periods` - Grant grace period
- `GET /api/appeals` - Get pending appeals
- `PUT /api/appeals/:id` - Approve/reject appeal
- `GET /api/audit-logs` - Get system activity logs

## Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout with auth provider
│   ├── page.tsx                # Home/landing page
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── dashboard/              # Learner dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard home
│   │   ├── courses/page.tsx    # My courses
│   │   ├── progress/page.tsx   # Progress tracking
│   │   ├── cohorts/page.tsx    # Instructor: my cohorts
│   │   └── learners/page.tsx   # Instructor: learner management
│   ├── admin/                  # Admin dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── cohorts/page.tsx    # Cohort management
│   │   ├── learners/page.tsx   # Learner management
│   │   ├── recommendations/page.tsx # Review submissions
│   │   └── audit-logs/page.tsx # System logs
│   └── globals.css             # Theme and styles
├── components/
│   ├── dashboard-sidebar.tsx   # Sidebar navigation
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── api.ts                  # API client
│   ├── auth-context.tsx        # Auth context provider
│   └── utils.ts                # Utility functions
├── server.js                   # Express backend server
├── package.json
├── tsconfig.json
├── next.config.mjs
└── .env.local                  # Environment variables
```

## Key Design Patterns

### Authentication Flow
1. User registers/logs in
2. Backend validates credentials and issues JWT
3. Token stored in localStorage and AuthContext
4. All API requests include Authorization header
5. Protected routes check authentication before rendering

### Role-Based Access Control
- **Learner**: Access to own dashboard and progress
- **Instructor**: Access to assigned cohorts and learner monitoring
- **Admin**: Full system management (except audit logs)
- **Super Admin**: Complete system access including audit logs

### State Management
- AuthContext for global auth state
- Component-level state for UI interactions
- Direct API calls for data fetching (can be enhanced with SWR for caching)

## Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Collapsible sidebar navigation
- Responsive grid layouts
- Touch-friendly buttons and interactive elements
- Optimized layouts for all screen sizes (mobile, tablet, desktop)

## Performance Optimizations

1. **Code Splitting**: Next.js automatic route-based splitting
2. **Image Optimization**: Next.js Image component (when needed)
3. **API Efficiency**: Batch requests where possible
4. **Component Memoization**: React.memo for performance-critical components
5. **CSS-in-JS**: Tailwind for minimal CSS overhead

## Security Considerations

1. **Password Security**: bcryptjs with salt rounds of 10
2. **JWT Tokens**: Secure signature with environment variable secret
3. **CORS**: Configured to allow frontend requests only
4. **Input Validation**: Zod schemas (can be extended)
5. **SQL/NoSQL Injection**: Mongoose handles parameterized queries
6. **XSS Protection**: React automatically escapes content
7. **CSRF Protection**: Can be added with middleware

## Next Steps & Enhancements

### Recommended Additions
1. **Email Notifications**: Implement email alerts for status changes
2. **Real-time Updates**: WebSocket integration for live notifications
3. **File Uploads**: Support for course materials and assignments
4. **Advanced Analytics**: More detailed performance dashboards
5. **Gamification**: Badges, leaderboards, and achievement system
6. **Mobile App**: React Native version
7. **Video Streaming**: Embedded lesson videos with progress tracking
8. **Assessment System**: Quiz/test creation and automatic grading

### Testing
```bash
# Add testing framework
npm install --save-dev jest @testing-library/react

# Create test files in __tests__ directories
```

### Deployment

**Frontend (Vercel - Recommended):**
```bash
npm run build
# Deploy via Vercel CLI or GitHub integration
```

**Backend (Railway, Heroku, AWS):**
```bash
# Ensure PORT env variable is set
npm run server
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running: `mongod`
- Check connection string in .env.local
- Verify network access for MongoDB Atlas

### API CORS Errors
- Ensure CORS is enabled in server.js
- Check NEXT_PUBLIC_API_URL matches backend URL

### Authentication Issues
- Clear browser localStorage and try again
- Check JWT_SECRET is consistent
- Verify tokens in browser DevTools > Application > Local Storage

### UI/Styling Issues
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

## Support & Documentation

For issues or questions:
1. Check logs in browser console and server terminal
2. Verify environment variables are set correctly
3. Ensure both frontend and backend servers are running
4. Review API response status codes in Network tab

## License

This project is built for DexterHub and follows their usage terms.

---

**Happy Learning!** 🚀
