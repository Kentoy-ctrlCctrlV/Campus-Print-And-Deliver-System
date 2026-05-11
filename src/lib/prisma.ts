import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let prisma: any;
let isInitialized = false;

const initPrisma = async () => {
  if (!isInitialized) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({
      log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    isInitialized = true;
  }
  return prisma;
};

export const getPrisma = async () => {
  if (!isInitialized) {
    await initPrisma();
  }
  return prisma;
};

export { initPrisma };