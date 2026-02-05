# LMS Redesign - Quick Start Guide

## 🚀 Getting Started

Your LMS has been redesigned with a modern UI and separated backend! Follow these steps to run the new system.

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Two terminal windows

## Step 1: Start the Backend Server

```bash
# Terminal 1
cd backend
npm install
npm run dev
```

✅ Backend will start on `http://localhost:5000`

## Step 2: Start the Frontend

```bash
# Terminal 2 (from project root)
npm run dev
```

✅ Frontend will start on `http://localhost:3000`

## Step 3: Access the Application

Open your browser to: `http://localhost:3000`

## What's New?

### 🎨 Modern Design System
- Vibrant color palette (mint, peach, lavender, yellow)
- Colorful stat cards with icons
- Beautiful course cards with progress bars
- Modern calendar widget
- Upcoming events sidebar

### 🏗️ Separated Backend
- Professional MVC architecture
- Organized routes, controllers, models
- Independent deployment ready
- Located in `backend/` directory

### 📱 Redesigned Learner Dashboard
- Overview stats section
- My Classes with colorful cards
- Today Tasks with tabs
- Calendar integration
- Upcoming events

## Environment Variables

### Backend (.env in backend/)
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=5000
```

### Frontend (.env in root)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify .env file exists in `backend/`
- Run `npm install` in backend directory

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS is enabled (it is by default)
- Verify NEXT_PUBLIC_API_URL in frontend .env

### Styles not loading
- Clear Next.js cache: `rm -rf .next`
- Restart frontend dev server

## Next Steps

Continue the redesign:
1. Instructor dashboard pages
2. Admin dashboard pages
3. Login/Register pages
4. Additional learner pages

## Need Help?

Check the documentation:
- `backend/README.md` - Backend API documentation
- `walkthrough.md` - Complete redesign walkthrough
- `implementation_plan.md` - Original plan

Enjoy your redesigned LMS! 🎉
