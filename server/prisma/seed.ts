import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productTypes = ['Food', 'Apparel', 'Electronics'];

  for (const name of productTypes) {
    await prisma.productType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Seeded product types successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });