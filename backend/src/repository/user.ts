import { prisma } from '@backend/db/client/sync';
import { Prisma, User } from '@prisma/client';
import { PrismaRepositoryBase } from './base';

export class UserRepository extends PrismaRepositoryBase<User> {
  model = prisma.user;

  getUserByCognitoUsername = async (username: string) => this.model.findUnique({ where: { username } });

  getUserByEmail = async (email: string) => this.model.findFirst({ where: { email } });

  create = async (data: Prisma.UserCreateInput) => this.model.create({ data });
}
