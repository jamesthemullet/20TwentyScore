import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma, Season } from '@prisma/client';
import { requirePremium, requireSession } from '../../../lib/apiAuth';
import { prisma } from '../../../lib/prisma';

type SeasonWithCount = Prisma.SeasonGetPayload<{
  include: { _count: { select: { gameSaves: true } } };
}>;

type SeasonListItem = Omit<SeasonWithCount, '_count'> & { gameCount: number };
type SeasonsIndexResponse = SeasonListItem[] | Season | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SeasonsIndexResponse>) {
  const session = await requireSession(req, res);
  if (!session) return;

  const userId = session.user.id;

  if (!(await requirePremium(userId, res))) return;

  if (req.method === 'GET') {
    const seasons = await prisma.season.findMany({
      where: { userId },
      include: { _count: { select: { gameSaves: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(seasons.map(({ _count, ...s }) => ({ ...s, gameCount: _count.gameSaves })));
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
