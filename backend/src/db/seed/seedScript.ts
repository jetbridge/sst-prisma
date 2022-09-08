import { seedFakerSampleData } from '@backend/db/seed/fakeSampleData';
import { getPrisma } from '@backend/db/client';

await seedFakerSampleData();
const prisma = await getPrisma();
await prisma.$disconnect();
