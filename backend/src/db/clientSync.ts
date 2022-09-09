import { getPrisma } from '@backend/db/client';

/**
 * This will grab a connection to the database upon import (cold start).
 *
 * It will block the app from starting if the database is not available
 * and will make your code slower if it doesn't need to talk to the database.
 *
 * But you don't have to await getting a connection.
 */
export const prisma = await getPrisma();
