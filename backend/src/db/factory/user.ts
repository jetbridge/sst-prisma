import { faker } from '@faker-js/faker/locale/en_US';
import { Prisma } from '@prisma/client';
import { Factory } from 'fishery';
import { v4 } from 'uuid';

export const userFactory = Factory.define<Prisma.UserCreateInput>(() => ({
  id: v4(),
  createdAt: new Date(),
  username: faker.internet.userName(),
  name: faker.name.fullName(),
  email: faker.internet.email(),
  avatarUrl: faker.internet.avatar(),
}));
