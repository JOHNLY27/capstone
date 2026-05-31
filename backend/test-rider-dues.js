import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function makeRiderOverdue() {
  const email = process.argv[2] || 'rider@fetchmeup.com'; // Default rider email
  
  try {
    const rider = await prisma.user.findFirst({
      where: { 
        email: email,
        role: 'RIDER'
      }
    });

    if (!rider) {
      console.log(`\n❌ Error: Rider with email "${email}" not found in database.`);
      console.log(`Available riders in your database can be checked under the admin panel.`);
      return;
    }

    const currentSettings = rider.settings || {};
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Shift due date to yesterday

    const updatedSettings = {
      ...currentSettings,
      weeklyFeeStatus: 'OVERDUE',
      feeDueDate: yesterday.toISOString()
    };

    await prisma.user.update({
      where: { id: rider.id },
      data: { settings: updatedSettings }
    });

    console.log(`\n======================================================`);
    console.log(`✅ SUCCESS: Rider "${rider.name}" is now OVERDUE!`);
    console.log(`======================================================`);
    console.log(`📧 Rider Email : ${rider.email}`);
    console.log(`📅 Due Date     : ${yesterday.toLocaleString()}`);
    console.log(`🔒 Status       : OVERDUE (Account Suspended)`);
    console.log(`======================================================`);
    console.log(`\n👉 NEXT STEPS FOR E2E TESTING:`);
    console.log(`1. Open the Mobile App and log in as this Rider.`);
    console.log(`2. Go to "Earnings" - you will see the RED alert card.`);
    console.log(`3. Try to accept a customer errand. It will block you!`);
    console.log(`4. Click "Settle Dues", scan the QR, type 13 digits, and submit.`);
    console.log(`5. Open the Admin Dashboard (http://localhost:5173/admin/withdrawals).`);
    console.log(`6. You will see the GCash reference. Click "Approve Payment".`);
    console.log(`7. Confirm the rider immediately gets unlocked!`);
  } catch (e) {
    console.error('Error updating rider settings:', e);
  } finally {
    await prisma.$disconnect();
  }
}

makeRiderOverdue();
