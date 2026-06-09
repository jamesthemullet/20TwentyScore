import { prisma } from './prisma';

export async function getUserTier(userId: string): Promise<'free' | 'premium'> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });
  if (subscription && ['active', 'trialing'].includes(subscription.status)) {
    return 'premium';
  }
  return 'free';
}

export async function getGameSaveCount(userId: string): Promise<number> {
  return prisma.gameSave.count({ where: { userId } });
}
