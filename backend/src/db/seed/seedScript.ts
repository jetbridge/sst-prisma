import { seedFakerSampleData } from '@backend/db/seed/fakeSampleData';

const { prisma } = await import('@backend/db/clientSync');

await seedFakerSampleData();
await prisma.$disconnect();
