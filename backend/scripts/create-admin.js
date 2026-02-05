require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@dexterhub.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists
        let admin = await User.findOne({ email });

        if (admin) {
            console.log('Admin user already exists');
            admin.password = hashedPassword;
            admin.role = 'admin';
            admin.firstName = 'Admin';
            admin.lastName = 'User';
            await admin.save();
            console.log('Admin user updated');
        } else {
            admin = new User({
                firstName: 'Admin',
                lastName: 'User',
                email,
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            });
            await admin.save();
            console.log('Admin user created');
        }

        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
