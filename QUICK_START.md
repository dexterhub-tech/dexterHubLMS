# DexterHub LMS - Quick Start Checklist

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Installation (1 min)
```bash
# Clone and install
cd dexterhub-lms
npm install
```

### Step 2: Environment Setup (2 min)
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/dexterhub-lms
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
PORT=5000
```

**MongoDB Options:**
- **Local**: Use the connection string above (ensure MongoDB is running)
- **Cloud**: Get URI from MongoDB Atlas and paste it

### Step 3: Start Servers (1 min)

**Terminal 1 - Backend:**
```bash
npm run server:dev
# Wait for: "Server running on port 5000"
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Wait for: "Local: http://localhost:3000"
```

### Step 4: Access the App (1 min)
1. Open http://localhost:3000
2. Click "Sign up" or use demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123456`

### Step 5: Explore Features (optional)
- **Learner**: View dashboard, courses, and progress
- **Instructor**: Manage cohorts and learners (create in admin first)
- **Admin**: Create cohorts, manage learners, review recommendations

---

## 📋 What's Working

✅ Authentication (Register/Login)
✅ Learner Dashboard with progress tracking
✅ Instructor tools for learner management
✅ Admin dashboard with cohort creation
✅ Drop recommendations and appeals
✅ Audit logging for super admins
✅ Responsive mobile design
✅ Modern UI with dark mode support

---

## 🔧 Common First-Time Setup Issues

### MongoDB Not Found
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Use MongoDB Compass or Atlas (Cloud)
```

### Port Already in Use
```bash
# Change port in server.js:
const PORT = process.env.PORT || 5001; // Change 5000 to 5001
```

### CORS Errors
Ensure both servers are running:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Clear Cache
```bash
# Remove Next.js cache
rm -rf .next

# Reinstall modules
rm -rf node_modules
npm install
```

---

## 🎯 Test These Features

### 1. Authentication
1. Go to `/register`
2. Create a new account
3. Log in with credentials
4. Verify redirect to dashboard

### 2. Learner Dashboard
1. Log in as learner
2. View dashboard stats
3. Navigate to "My Courses"
4. Check "My Progress" page

### 3. Instructor Features
1. Create learner account in admin
2. Switch to instructor account
3. View "My Cohorts"
4. Add notes to learners

### 4. Admin Features
1. Go to `/admin`
2. Create a new cohort
3. View learner list
4. Check audit logs (Super Admin only)

---

## 📱 Mobile Testing

### Browser DevTools
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device size (iPhone, iPad, etc.)
4. Test navigation and layout

### Test on Actual Device
```bash
# Get your local IP
ipconfig getifaddr en0  # Mac
hostname -I             # Linux
ipconfig                # Windows

# Access from mobile
http://YOUR_IP:3000
```

---

## 🔌 API Testing

### Quick Test with curl
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","password":"test123","role":"learner"}'

# Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get Cohorts (use token from login)
curl -X GET http://localhost:5000/api/cohorts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev                    # Start frontend
npm run server:dev            # Start backend

# Production Build
npm run build                 # Build frontend
npm run start                 # Start production frontend

# Formatting & Linting
npm run lint                  # Run linter

# Clean Cache
rm -rf .next node_modules    # Full clean
npm install                  # Reinstall

# Check Ports
lsof -i :3000               # Check port 3000
lsof -i :5000               # Check port 5000
```

---

## 📚 Project Structure Quick Reference

```
DexterHub/
├── app/
│   ├── page.tsx              ← Home page
│   ├── login/page.tsx        ← Login
│   ├── register/page.tsx     ← Register
│   ├── dashboard/            ← Learner dashboards
│   └── admin/                ← Admin dashboards
├── components/
│   ├── dashboard-sidebar.tsx ← Navigation
│   └── ui/                   ← shadcn components
├── lib/
│   ├── api.ts                ← API client
│   └── auth-context.tsx      ← Auth state
├── server.js                 ← Backend server
├── .env.local                ← Config (create this)
└── SETUP.md                  ← Full setup guide
```

---

## 🎓 Learning Path

**First time?** Follow this order:

1. **Understand the home page**
   - Visit http://localhost:3000
   - Read feature descriptions

2. **Create an account**
   - Sign up as a learner
   - Explore dashboard features

3. **Switch to admin**
   - Create a cohort
   - Add learners manually (edit admin pages to enable)

4. **Test instructor features**
   - Create instructor account
   - Review learner management tools

5. **Check admin capabilities**
   - Review recommendations system
   - Understand appeal workflow

---

## 🐛 Debug Mode

### Enable Console Logs
Add this to components:
```javascript
console.log('[v0]', 'Your message', data);
```

### Check API Responses
1. Open DevTools → Network tab
2. Make an API call
3. Click the request
4. View "Response" tab

### Monitor Backend
Watch server terminal for logs:
```
MongoDB connected
Server running on port 5000
POST /api/auth/login 200
```

---

## ✅ Pre-Deployment Checklist

Before going to production:

- [ ] Change JWT_SECRET in `.env.production`
- [ ] Use MongoDB Atlas instead of local DB
- [ ] Set up proper error logging
- [ ] Test all API endpoints
- [ ] Configure CORS properly
- [ ] Set up email notifications
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Test on mobile devices
- [ ] Set up monitoring

---

## 🆘 Getting Help

### Check These Files First
1. `SETUP.md` - Detailed setup guide
2. `DEVELOPER_GUIDE.md` - Development patterns
3. `PROJECT_SUMMARY.md` - Feature overview

### Common Issues

**Error: Cannot find module 'express'**
```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
```

**Error: MongoDB connection failed**
- Check MongoDB is running
- Verify connection string in .env.local
- For Atlas, allow your IP in Network Access

**Error: Port 3000 or 5000 already in use**
```bash
# Kill process on port (macOS/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**Error: React Component error**
- Clear `.next` folder
- Restart dev server
- Check browser console for specific error

---

## 🎉 You're Ready!

Your LMS is now running. Start exploring the features and customize as needed.

**Next Steps:**
1. Read `DEVELOPER_GUIDE.md` to add custom features
2. Check `SETUP.md` for production deployment
3. Review `PROJECT_SUMMARY.md` for feature overview

Happy learning! 🚀

---

**Pro Tips:**
- Keep both servers running in separate terminal windows
- Use VS Code REST Client extension for API testing
- Enable dark mode in settings for better development experience
- Bookmark http://localhost:3000 for quick access

**Questions?** Check the documentation files or review the code comments.
