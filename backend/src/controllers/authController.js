const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }


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

        res.status(201).json({
            user: {
                id: user._id,
                email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                activeCohortId: user.activeCohortId
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user._id,
                email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                activeCohortId: user.activeCohortId
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                activeCohortId: user.activeCohortId
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User with this email does not exist' });
        }

        // Generate reset token
        const token = crypto.randomBytes(20).toString('hex');
        
        // Token expires in 1 hour
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        // Send email
        const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'https://learn.dextertechhq.com';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 700;">Dexter<span style="color: #0f172a;">Hub</span></h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px; font-weight: 500; text-transform: uppercase; tracking-wider;">Security Portal</p>
                </div>
                <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 24px;"></div>
                <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-top: 0;">Hello ${user.firstName || 'User'},</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">We received a request to reset the password for your DexterHub account. If you did not make this request, you can safely ignore this email.</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">Otherwise, please click the button below to set a new password. This link will expire in 1 hour:</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1); transition: all 0.2s;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 0;">If you're having trouble with the button, copy and paste the URL below into your web browser:</p>
                <p style="font-size: 12px; color: #64748b; line-height: 1.6; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9; margin-top: 8px;">${resetUrl}</p>
                <div style="height: 1px; background-color: #f1f5f9; margin: 24px 0;"></div>
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} DexterHub. All rights reserved.</p>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Reset your DexterHub password',
            html: emailHtml
        });

        res.json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        // Send confirmation email
        const confirmHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #10b981; margin: 0; font-size: 28px; font-weight: 700;">Dexter<span style="color: #0f172a;">Hub</span></h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px; font-weight: 500; text-transform: uppercase; tracking-wider;">Security Portal</p>
                </div>
                <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 24px;"></div>
                <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-top: 0;">Hello ${user.firstName || 'User'},</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">This is a confirmation that the password for your DexterHub account has been successfully changed.</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">If you did not perform this action, please contact our support team immediately.</p>
                <div style="height: 1px; background-color: #f1f5f9; margin: 24px 0;"></div>
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} DexterHub. All rights reserved.</p>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Your DexterHub password was reset successfully',
            html: confirmHtml
        });

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
