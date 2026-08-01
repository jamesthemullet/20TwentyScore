import type { NextApiRequest, NextApiResponse } from 'next';
import type { GameSave, Season } from '@prisma/client';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

type SaveListItem = Pick<GameSave, 'id' | 'title' | 'createdAt' | 'completed' | 'seasonId'>;
type SeasonDetail = Season & { gameSaves: SaveListItem[] };
type SeasonsIdResponse = SeasonDetail | Season | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SeasonsIdResponse>) {
  const session = await requireSession(req, res);
  if (!session) return;

  const userId = session.user.id;

  const tier = await getUserTier(userId);
  if (tier === 'free') {
    return res.status(402).json({ error: 'PREMIUM_REQUIRED' });
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) return res.status(404).json({ error: 'Not found' });
  if (season.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const saves = await prisma.gameSave.findMany({
      where: { seasonId: id },
      select: { id: true, title: true, createdAt: true, completed: true, seasonId: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ ...season, gameSaves: saves });
  }

  if (req.method === 'PATCH') {
    const { name, description } = req.body as { name?: string; description?: string };
    const data: { name?: string; description?: string } = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    const updated = await prisma.season.update({ where: { id }, data });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.season.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  res.status(405).end();
}
