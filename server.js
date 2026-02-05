const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dexterhub-lms';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ============== SCHEMAS ==============

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['learner', 'instructor', 'admin', 'super-admin'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'dropped'], default: 'active' },
  activeCohortId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

// Cohort Schema
const cohortSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'archived'], default: 'upcoming' },
  instructorIds: [mongoose.Schema.Types.ObjectId],
  learnerIds: [mongoose.Schema.Types.ObjectId],
  courseIds: [mongoose.Schema.Types.ObjectId],
  performanceThreshold: { type: Number, default: 70 }, // Minimum score %
  weeklyTarget: { type: Number, default: 10 }, // Hours per week
  gracePeriodDays: { type: Number, default: 3 },
  reviewCycleFrequency: { type: String, enum: ['weekly', 'bi-weekly', 'monthly'], default: 'weekly' },
  createdAt: { type: Date, default: Date.now },
});

// Course Schema
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  duration: Number, // in hours
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  createdAt: { type: Date, default: Date.now },
});

// Module Schema
const moduleSchema = new mongoose.Schema({
  courseId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  duration: Number,
  createdAt: { type: Date, default: Date.now },
});

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  moduleId: mongoose.Schema.Types.ObjectId,
  name: String,
  content: String,
  videoUrl: String,
  duration: Number, // in minutes
  createdAt: { type: Date, default: Date.now },
});

// Learner Progress Schema
const learnerProgressSchema = new mongoose.Schema({
  learnerId: mongoose.Schema.Types.ObjectId,
  cohortId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  completedLessons: [mongoose.Schema.Types.ObjectId],
  currentScore: { type: Number, default: 0 },
  learningHoursThisWeek: { type: Number, default: 0 },
  status: { type: String, enum: ['on-track', 'at-risk', 'under-review', 'dropped'], default: 'on-track' },
  lastActivityDate: Date,
  inactivityDays: { type: Number, default: 0 },
  lastAssessmentDate: Date,
  lastAssessmentScore: Number,
  updatedAt: { type: Date, default: Date.now },
});

// Instructor Note Schema
const instructorNoteSchema = new mongoose.Schema({
  instructorId: mongoose.Schema.Types.ObjectId,
  learnerId: mongoose.Schema.Types.ObjectId,
  cohortId: mongoose.Schema.Types.ObjectId,
  note: String,
  type: { type: String, enum: ['mentoring', 'warning', 'recommendation', 'general'], default: 'general' },
  actionRequired: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Drop Recommendation Schema
const dropRecommendationSchema = new mongoose.Schema({
  learnerId: mongoose.Schema.Types.ObjectId,
  cohortId: mongoose.Schema.Types.ObjectId,
  instructorId: mongoose.Schema.Types.ObjectId,
  reason: String,
  evidence: String, // Details supporting the recommendation
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'appealed'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedBy: mongoose.Schema.Types.ObjectId,
  reviewedAt: Date,
  reviewNotes: String,
});

// Grace Period Schema
const gracePeriodSchema = new mongoose.Schema({
  learnerId: mongoose.Schema.Types.ObjectId,
  cohortId: mongoose.Schema.Types.ObjectId,
  grantedBy: mongoose.Schema.Types.ObjectId,
  reason: String,
  extensionDays: { type: Number, default: 3 },
  originalDeadline: Date,
  newDeadline: Date,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});

// Appeal Schema
const appealSchema = new mongoose.Schema({
  learnerId: mongoose.Schema.Types.ObjectId,
  cohortId: mongoose.Schema.Types.ObjectId,
  dropRecommendationId: mongoose.Schema.Types.ObjectId,
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedBy: mongoose.Schema.Types.ObjectId,
  reviewedAt: Date,
  reviewNotes: String,
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  actor: mongoose.Schema.Types.ObjectId,
  action: String,
  targetUser: mongoose.Schema.Types.ObjectId,
  targetCohort: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// ============== MODELS ==============
const User = mongoose.model('User', userSchema);
const Cohort = mongoose.model('Cohort', cohortSchema);
const Course = mongoose.model('Course', courseSchema);
const Module = mongoose.model('Module', moduleSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);
const LearnerProgress = mongoose.model('LearnerProgress', learnerProgressSchema);
const InstructorNote = mongoose.model('InstructorNote', instructorNoteSchema);
const DropRecommendation = mongoose.model('DropRecommendation', dropRecommendationSchema);
const GracePeriod = mongoose.model('GracePeriod', gracePeriodSchema);
const Appeal = mongoose.model('Appeal', appealSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// ============== MIDDLEWARE ==============
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// ============== AUTH ROUTES ==============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'learner',
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: { id: user._id, email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    res.json({ user: { id: user._id, email, role: user.role, firstName: user.firstName, lastName: user.lastName }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== COHORT ROUTES ==============
app.get('/api/cohorts', authMiddleware, async (req, res) => {
  try {
    const cohorts = await Cohort.find();
    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cohorts', authMiddleware, roleMiddleware(['admin', 'super-admin']), async (req, res) => {
  try {
    const cohort = new Cohort(req.body);
    await cohort.save();
    res.status(201).json(cohort);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cohorts/:id', authMiddleware, async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.id);
    res.json(cohort);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== LEARNER PROGRESS ROUTES ==============
app.get('/api/learner-progress/:learnerId', authMiddleware, async (req, res) => {
  try {
    const progress = await LearnerProgress.find({ learnerId: req.params.learnerId });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cohorts/:cohortId/learners', authMiddleware, async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.cohortId);
    const learners = await User.find({ _id: { $in: cohort.learnerIds } });
    
    // Get progress for all learners
    const learnersWithProgress = await Promise.all(
      learners.map(async (learner) => {
        const progress = await LearnerProgress.findOne({
          learnerId: learner._id,
          cohortId: req.params.cohortId,
        });
        return {
          ...learner.toObject(),
          progress: progress || { status: 'on-track', currentScore: 0 },
        };
      })
    );

    res.json(learnersWithProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== INSTRUCTOR ROUTES ==============
app.post('/api/instructor-notes', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
  try {
    const note = new InstructorNote({
      ...req.body,
      instructorId: req.user.id,
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drop-recommendations', authMiddleware, roleMiddleware(['instructor']), async (req, res) => {
  try {
    const recommendation = new DropRecommendation({
      ...req.body,
      instructorId: req.user.id,
    });
    await recommendation.save();
    res.status(201).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== ADMIN ROUTES ==============
app.get('/api/drop-recommendations', authMiddleware, roleMiddleware(['admin', 'super-admin']), async (req, res) => {
  try {
    const recommendations = await DropRecommendation.find({ status: 'pending' })
      .populate('learnerId')
      .populate('instructorId');
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/drop-recommendations/:id', authMiddleware, roleMiddleware(['admin', 'super-admin']), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const recommendation = await DropRecommendation.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    
    // If approved, update learner status
    if (status === 'approved') {
      await User.findByIdAndUpdate(recommendation.learnerId, { status: 'dropped' });
      await LearnerProgress.updateOne(
        { learnerId: recommendation.learnerId, cohortId: recommendation.cohortId },
        { status: 'dropped' }
      );
    }

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/grace-periods', authMiddleware, roleMiddleware(['admin', 'super-admin']), async (req, res) => {
  try {
    const { learnerId, cohortId, extensionDays, reason } = req.body;
    
    const gracePeriod = new GracePeriod({
      learnerId,
      cohortId,
      grantedBy: req.user.id,
      extensionDays,
      reason,
      originalDeadline: new Date(),
      newDeadline: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000),
    });

    await gracePeriod.save();
    res.status(201).json(gracePeriod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== APPEAL ROUTES ==============
app.post('/api/appeals', authMiddleware, roleMiddleware(['learner']), async (req, res) => {
  try {
    const appeal = new Appeal({
      ...req.body,
      learnerId: req.user.id,
    });
    await appeal.save();
    res.status(201).json(appeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/appeals', authMiddleware, roleMiddleware(['admin', 'super-admin']), async (req, res) => {
  try {
    const appeals = await Appeal.find({ status: 'pending' })
      .populate('learnerId')
      .populate('dropRecommendationId');
    res.json(appeals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/appeals/:id', authMiddleware, roleMiddleware(['admin', 'super-admin']), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const appeal = await Appeal.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    // If appeal approved, reverse the drop
    if (status === 'approved') {
      await User.findByIdAndUpdate(appeal.learnerId, { status: 'active' });
      await LearnerProgress.updateOne(
        { learnerId: appeal.learnerId },
        { status: 'on-track' }
      );
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== AUDIT LOG ROUTES ==============
app.get('/api/audit-logs', authMiddleware, roleMiddleware(['admin', 'super-admin']), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
