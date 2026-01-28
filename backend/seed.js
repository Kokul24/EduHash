const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Ensure path is correct
const Fee = require('./models/Fee');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedDB = async () => {
    try {
        // 1. Clear existing data
        await User.deleteMany({});
        await Fee.deleteMany({});
        console.log('🗑️  Previous data cleared.');

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('NistSecurePassword@123', salt);

        // 3. Create ONLY the Admin User
        // Using +admin alias so emails go to eduhash23@gmail.com with a label
        const adminUser = await User.create({
            name: 'System Administrator',
            email: 'eduhash23+admin@gmail.com', // <--- New Admin Email
            password: hashedPassword,
            role: 'admin',
            is2FAEnabled: true // Enforce 2FA for Admin
        });

        console.log('✅ Admin Account Created:');
        console.log(`   Email: ${adminUser.email}`);
        console.log('   Pass:  NistSecurePassword@123');




        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
