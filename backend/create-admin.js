const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    console.log('🔍 Checking if admin user already exists...');
    const existingAdmin = await User.findOne({ email: 'sihan@kyokushin.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', `${existingAdmin.profile.firstName} ${existingAdmin.profile.lastName}`);
      console.log('Role:', existingAdmin.role);
      console.log('Status:', existingAdmin.status);
      return;
    }

    console.log('🔨 Creating admin user...');
    // Create Sihan Vasant Singh as admin
    const adminUser = await User.create({
      email: 'sihan@kyokushin.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin',
      status: 'approved', // Admin is auto-approved
      profile: {
        firstName: 'Sihan',
        lastName: 'Vasant Singh',
        phoneNumber: '+1-555-0000',
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: sihan@kyokushin.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('👑 Name: Sihan Vasant Singh');
    console.log('✅ Status: approved');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.log('ℹ️  Admin user might already exist (duplicate key error)');
    }
  } finally {
    console.log('🔌 Closing MongoDB connection...');
    mongoose.connection.close();
  }
};

createAdminUser();
