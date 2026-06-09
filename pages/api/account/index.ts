import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const tier = await getUserTier(session.user.id);

  res.json({ user, subscription, tier });
}
