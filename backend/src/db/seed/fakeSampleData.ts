import { truncateAllTables } from '@backend/db/seed/truncate';
import { userFactory } from '@backend/db/factory/user';
import { Prisma } from '@prisma/client';

const { prisma } = await import('@backend/db/clientSync');

export async function seedFakerSampleData() {
  prisma.$transaction(startSeeding, { maxWait: 30_000, timeout: 60_000 });
}

export async function startSeeding(prisma: Prisma.TransactionClient) {
  if (process.env.CLEAN_SEED) {
    // Remove old data
    truncateAllTables(prisma);
  }

  // Create 5 fake users with generated data
  await prisma.user.createMany({ data: userFactory.buildList(5) });
  // Create 1 user with some custom data
  await prisma.user.create({
    data: userFactory.build({
      name: 'Robert Lewandowski',
      email: 'lewa@fcbarcelona.com',
    }),
  });
}
