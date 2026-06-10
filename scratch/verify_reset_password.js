const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const User = require('../backend/src/models/User');
const authController = require('../backend/src/controllers/authController');

const TEST_EMAIL = 'reset_test_user@example.com';
const INITIAL_PASSWORD = 'oldPassword123';
const NEW_PASSWORD = 'newPassword456';

async function runVerification() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Clean up existing test user if any
        await User.deleteOne({ email: TEST_EMAIL });
        console.log('Cleaned up previous test user.');

        // 2. Create a fresh test user
        const hashedPassword = await bcrypt.hash(INITIAL_PASSWORD, 10);
        const testUser = new User({
            firstName: 'Reset',
            lastName: 'Test',
            email: TEST_EMAIL,
            password: hashedPassword,
            role: 'learner',
            status: 'active'
        });
        await testUser.save();
        console.log('Created test user:', TEST_EMAIL);

        // 3. Test Forgot Password logic
        console.log('\n--- Testing forgotPassword controller ---');
        let forgotResCode = null;
        let forgotResBody = null;
        
        const forgotReq = {
            body: { email: TEST_EMAIL },
            headers: { origin: 'http://localhost:3000' }
        };
        const forgotRes = {
            status: function(code) {
                forgotResCode = code;
                return this;
            },
            json: function(body) {
                forgotResBody = body;
                return this;
            }
        };

        await authController.forgotPassword(forgotReq, forgotRes);
        console.log('Response Status:', forgotResCode || 200);
        console.log('Response Body:', forgotResBody);

        // Verify user document has token and expiry
        const userWithToken = await User.findOne({ email: TEST_EMAIL });
        console.log('Token exists in DB:', !!userWithToken.resetPasswordToken);
        console.log('Expiry exists in DB:', !!userWithToken.resetPasswordExpires);
        console.log('Token value:', userWithToken.resetPasswordToken);

        if (!userWithToken.resetPasswordToken) {
            throw new Error('Forgot password did not generate token');
        }

        // 4. Test Reset Password with Invalid Token
        console.log('\n--- Testing resetPassword with invalid token ---');
        let resetInvalidCode = null;
        let resetInvalidBody = null;

        const resetInvalidReq = {
            body: {
                token: 'invalid-token-1234',
                password: NEW_PASSWORD
            }
        };
        const resetInvalidRes = {
            status: function(code) {
                resetInvalidCode = code;
                return this;
            },
            json: function(body) {
                resetInvalidBody = body;
                return this;
            }
        };

        await authController.resetPassword(resetInvalidReq, resetInvalidRes);
        console.log('Response Status (Expected 400):', resetInvalidCode);
        console.log('Response Body:', resetInvalidBody);

        if (resetInvalidCode !== 400) {
            throw new Error('Reset password should fail with status 400 for invalid token');
        }

        // 5. Test Reset Password with Valid Token
        console.log('\n--- Testing resetPassword with valid token ---');
        let resetValidCode = null;
        let resetValidBody = null;

        const resetValidReq = {
            body: {
                token: userWithToken.resetPasswordToken,
                password: NEW_PASSWORD
            }
        };
        const resetValidRes = {
            status: function(code) {
                resetValidCode = code;
                return this;
            },
            json: function(body) {
                resetValidBody = body;
                return this;
            }
        };

        await authController.resetPassword(resetValidReq, resetValidRes);
        console.log('Response Status (Expected 200/null):', resetValidCode || 200);
        console.log('Response Body:', resetValidBody);

        // Verify password is changed and tokens cleared
        const finalUser = await User.findOne({ email: TEST_EMAIL });
        console.log('Token cleared in DB:', finalUser.resetPasswordToken === null);
        console.log('Expiry cleared in DB:', finalUser.resetPasswordExpires === null);

        const isNewPasswordValid = await bcrypt.compare(NEW_PASSWORD, finalUser.password);
        console.log('Password successfully changed (can login with new password):', isNewPasswordValid);

        if (!isNewPasswordValid) {
            throw new Error('Password was not successfully updated in database');
        }

        // 6. Clean up after test
        await User.deleteOne({ email: TEST_EMAIL });
        console.log('\nVerification completed successfully. Test user cleaned up.');

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
}

runVerification();
