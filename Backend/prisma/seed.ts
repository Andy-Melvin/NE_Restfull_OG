import { PrismaClient, Role, Parking } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@parking.local' },
    update: {},
    create: {
      email: 'admin@parking.local',
      password: await bcrypt.hash('Admin@123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  // Create parking attendant
  const attendant = await prisma.user.upsert({
    where: { email: 'attendant@parking.local' },
    update: {},
    create: {
      email: 'attendant@parking.local',
      password: await bcrypt.hash('attendant123', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: Role.PARKING_ATTENDANT,
    },
  });

  // Create 30 parking lots with varying spaces
  const parkingLots: Parking[] = [];
  for (let i = 1; i <= 30; i++) {
    const code = `PARK${i.toString().padStart(3, '0')}`;
    const name = `Parking Lot ${i}`;
    const numberOfSpaces = Math.floor(Math.random() * 100) + 10; // 10 to 109 spaces
    const availableSpaces = numberOfSpaces;
    const location = `Location ${i}`;
    const chargingFeePerHour = parseFloat((Math.random() * 10 + 2).toFixed(2)); // $2.00 to $12.00
    const parking = await prisma.parking.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name,
        numberOfSpaces,
        availableSpaces,
        location,
        chargingFeePerHour,
      },
    });
    parkingLots.push(parking);
  }

  // Create some parking records
  const parkingRecords = await Promise.all([
    prisma.carParkingRecord.create({
      data: {
        plateNumber: 'ABC123',
        parkingCode: 'PARK001',
        entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        exitTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        chargedAmount: 5.00,
      },
    }),
    prisma.carParkingRecord.create({
      data: {
        plateNumber: 'XYZ789',
        parkingCode: 'PARK002',
        entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        // No exit time - car still parked
      },
    }),
    prisma.carParkingRecord.create({
      data: {
        plateNumber: 'DEF456',
        parkingCode: 'PARK003',
        entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        exitTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        chargedAmount: 24.00,
      },
    }),
  ]);

  console.log('Seeded database with:');
  console.log('- Admin user:', admin.email);
  console.log('- Parking attendant:', attendant.email);
  console.log('- Parking lots:', parkingLots.length);
  console.log('- Parking records:', parkingRecords.length);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
