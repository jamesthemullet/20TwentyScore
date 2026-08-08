import type { NextApiRequest, NextApiResponse } from 'next';
import type { User, Subscription } from '@prisma/client';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

type AccountResponse = {
  user: User | null;
  subscription: Subscription | null;
  tier: 'free' | 'premium';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<AccountResponse>) {
  const session = await requireSession(req, res);
  if (!session) return;

  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const tier = await getUserTier(session.user.id);

  res.json({ user, subscription, tier });
}
