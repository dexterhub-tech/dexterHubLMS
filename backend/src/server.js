const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cohorts', require('./routes/cohorts'));
app.use('/api/learner-progress', require('./routes/learners'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/instructors', require('./routes/instructors'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/events', require('./routes/events'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
