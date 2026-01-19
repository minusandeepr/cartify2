import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/user.model.js';

dotenv.config();

async function testAuth() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@cartify.com';
        const password = 'AdminPass123';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('User found:', user.email);
        console.log('Stored hash:', user.password);

        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);

        // Test manual bcrypt compare just in case
        const manualMatch = await bcrypt.compare(password, user.password);
        console.log('Manual bcrypt match result:', manualMatch);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testAuth();
