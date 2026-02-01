/**
 * Database Configuration
 * MongoDB connection setup
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            minPoolSize: 2,
            family: 4 // Force IPv4
        });
        console.log('✅ MongoDB Connected');
        return true;
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        console.log("💡 Tip: Check your IP Whitelist or try using a phone hotspot to rule out ISP blocking.");
        return false;
    }
};

module.exports = {
    connectDB
};
