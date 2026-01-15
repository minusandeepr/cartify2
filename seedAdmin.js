// seedAdmin.js (place at project root)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/user.model.js'; // path to your User model

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cartify.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123';

    // if admin already exists, show and exit
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('⚠️ Admin already exists:', existingAdmin.email);
        process.exit(0);
      } else {
        // upgrade existing user to admin
        existingAdmin.role = 'admin';
        // ensure username exists
        if (!existingAdmin.username) existingAdmin.username = 'admin';
        await existingAdmin.save();
        console.log('🔼 Existing user promoted to admin:', existingAdmin.email);
        process.exit(0);
      }
    }

    // Hash password before creating (your model also hashes in pre-save — either is fine)
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = new User({
      username: 'admin',               // <--- required field
      email: adminEmail,
      password: hashedPassword,
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

