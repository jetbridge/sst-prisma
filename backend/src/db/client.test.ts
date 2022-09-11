// Put this first in your DB integration test suites
import { describeIntegrationTest } from './testUtil';

import { Prisma } from '@prisma/client';
import { getPrisma } from './client';
import { prisma as prismaSync } from './clientSync';

// there can be only one
const UNIQUE_USER: Prisma.UserCreateInput = { id: '00000000-0000-0000-0000-000000000000', username: 'highlander' };

describeIntegrationTest('Prisma client', () => {
  test('Prisma client', async () => {
    const prisma = await getPrisma();

    const res = await prisma.$queryRaw<Array<{ one: number }>>`SELECT 1 as one`;
    expect(res[0].one).toEqual(1);

    await prisma.user.create({ data: UNIQUE_USER });
  });

  test('Prisma client synchronous', async () => {
    await prismaSync.user.create({ data: UNIQUE_USER });

    const res = await prismaSync.$queryRaw<Array<{ one: number }>>`SELECT 1 as one`;
    expect(res[0].one).toEqual(1);
  });
});
