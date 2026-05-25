const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../../../Downloads/lms-build/backend/.env') });

const User = require('../backend/src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const learner = await User.findOne({ role: 'learner' }).select('_id');
    if (learner) {
      console.log('LearnerID:', learner._id.toString());
    } else {
      console.log('No learner found');
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
