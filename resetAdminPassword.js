// resetAdminPassword.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/user.model.js';

dotenv.config();

async function reset() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@cartify.com';
    const newPlain = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123';

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Admin user not found:', email);
      process.exit(1);
    }

    
    user.password = newPlain;
    await user.save();

    console.log('✅ Admin password reset to plain value and hashed on save for', email);
    console.log('Use password:', newPlain);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password', err);
    process.exit(1);
  }
}

reset();
