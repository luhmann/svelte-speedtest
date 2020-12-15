import { PrismaClient } from '@prisma/client';

const database = new PrismaClient();

export * from '@prisma/client';
export { database };
