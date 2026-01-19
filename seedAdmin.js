// seedAdmin.js (place at project root)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/user.model.js'; // path to your User model

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function seedAdmin() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cartify.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123';

    // if admin already exists, show and update password
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin found, updating password/role...');
      existingAdmin.role = 'admin';
      existingAdmin.password = adminPassword; // Model will hash this
      if (!existingAdmin.username) existingAdmin.username = 'admin';
      await existingAdmin.save();
      console.log('✅ Admin updated successfully:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password before creating (your model also hashes in pre-save — either is fine)
    // REMOVED manual hashing to avoid double hashing as model hashes in pre-save

    const adminUser = new User({
      username: 'admin',               // <--- required field
      email: adminEmail,
      password: adminPassword, // Model will hash this
      role: 'admin'
    });

    await adminUser.save();
    console.log('🎉 Admin user created successfully:', adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();

