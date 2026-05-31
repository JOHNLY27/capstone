import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

const seedAdmin = async () => {
  const adminEmail = 'admin@fetchmeup.com';
  const adminPhone = '09000000000';
  const plainPassword = 'admin12345';

  try {
    console.log('🌱 Starting database seed for System Administrator...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { phone: adminPhone }
        ]
      }
    });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user already exists (Email: ${existingAdmin.email})`);
      process.exit(0);
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    // Create Admin User
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        phone: adminPhone,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
      },
    });

    console.log('✅ System Administrator successfully seeded!');
    console.log('--------------------------------------------------');
    console.log(`📧 Email:    ${admin.email}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding administrator:', err);
    process.exit(1);
  }
};

seedAdmin();
