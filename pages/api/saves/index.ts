import type { NextApiRequest, NextApiResponse } from 'next';
import type { GameSave } from '@prisma/client';
import { requireSession } from '../../../lib/apiAuth';
import { getGameSaveCount, getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

type SaveListItem = Pick<GameSave, 'id' | 'title' | 'createdAt' | 'completed' | 'seasonId'>;
type SavesIndexResponse = SaveListItem[] | GameSave | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SavesIndexResponse>) {
  const session = await requireSession(req, res);
  if (!session) return;

  const userId = session.user.id;

  if (req.method === 'GET') {
    const saves = await prisma.gameSave.findMany({
      where: { userId },
      select: { id: true, title: true, createdAt: true, completed: true, seasonId: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(saves);
  }

  if (req.method === 'POST') {
    const tier = await getUserTier(userId);
    if (tier === 'free') {
      const count = await getGameSaveCount(userId);
      if (count >= 1) {
        return res.status(402).json({ error: 'FREE_LIMIT_REACHED' });
      }
    }

    const { gameData, title, seasonId } = req.body as {
      gameData: unknown;
      title?: string;
      seasonId?: string;
    };

    if (!gameData) {
      return res.status(400).json({ error: 'gameData is required' });
    }

    const save = await prisma.gameSave.create({
      data: { userId, gameData, title, seasonId },
    });
    return res.status(201).json(save);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}
