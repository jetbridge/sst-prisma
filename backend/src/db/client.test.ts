import { getPrisma } from './client';
import { integrationTest } from './testUtil';

describe('Prisma client', () => {
  integrationTest('Prisma client', async () => {
    const prisma = await getPrisma();

    const res = await prisma.$queryRaw<Array<{ one: number }>>`SELECT 1 as one`;
    expect(res[0].one).toEqual(1);
  });
});
