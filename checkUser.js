import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@cartify.com';
        const user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('User found:');
            console.log('ID:', user._id);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Password Hash Length:', user.password.length);
            console.log('Password Hash Start:', user.password.substring(0, 10));
        } else {
            console.log('User not found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
