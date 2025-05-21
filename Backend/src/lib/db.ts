import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:melvin123@localhost:5432/parking_system"
    }
  }
});

export default prisma; 