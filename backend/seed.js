const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Ensure this path is correct
require('dotenv').config();

const users = [
    {
        name: 'Admin User',
        email: 'admin@eduhash.com',
        password: 'NistSecurePassword@123', // 20 chars
        role: 'admin'
    },
    {
        name: 'Rahul Student',
        email: 'student@eduhash.com',
        password: 'NistSecurePassword@123',
        role: 'student',
        studentId: '2021CS123'
    },
    {
        name: 'Audit Officer',
        email: 'auditor@eduhash.com',
        password: 'NistSecurePassword@123',
        role: 'auditor'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Check if users exist to avoid duplicates or clear them?
        // Let's just create if not exists or UPSERT
        for (const u of users) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                console.log(`User ${u.email} already exists.`);
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                await User.create({ ...u, password: hashedPassword });
                console.log(`Created ${u.role}: ${u.email}`);
            }
        }
        console.log('Seeding Complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
