import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

type SeasonWithCount = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { gameSaves: number };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  const userId = session.user.id;

  const tier = await getUserTier(userId);
  if (tier === 'free') {
    return res.status(402).json({ error: 'PREMIUM_REQUIRED' });
  }

  if (req.method === 'GET') {
    const seasons = await prisma.season.findMany({
      where: { userId },
      include: { _count: { select: { gameSaves: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(
      (seasons as SeasonWithCount[]).map(({ _count, ...s }) => ({ ...s, gameCount: _count.gameSaves }))
    );
  }

  if (req.method === 'POST') {
    const { name, description } = req.body as { name: string; description?: string };
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const season = await prisma.season.create({
      data: { userId, name, description },
    });
    return res.status(201).json(season);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}
