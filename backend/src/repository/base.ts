import { User } from '@prisma/client';

/**
 * Base class for repositories.
 * @param M - the model type (e.g. User)
 */
export abstract class PrismaRepositoryBase<M> {}

export abstract class RepositoryWithUserFilter<M> extends PrismaRepositoryBase<M> {
  abstract filterForUserRead(user: User): unknown;
  abstract filterForUserWrite(user: User): unknown;
}
