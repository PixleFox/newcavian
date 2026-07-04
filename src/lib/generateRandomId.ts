import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateUniqueRandomId(table: 'admin' | 'adminSession'): Promise<number> {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const id = Math.floor(10000 + Math.random() * 90000);
    const existing = await prisma[table].findUnique({ where: { id } });
    if (!existing) return id;
  }
  throw new Error('Unable to generate unique ID after multiple attempts');
}

export async function generateAdminId(): Promise<number> {
  return generateUniqueRandomId('admin');
}

export async function generateSessionId(): Promise<number> {
  return generateUniqueRandomId('adminSession');
}