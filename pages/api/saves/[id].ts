import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import { requireSession } from '../../../lib/apiAuth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  const { id } = req.query as { id: string };
  const userId = session.user.id;

  const save = await prisma.gameSave.findUnique({ where: { id } });

  if (!save) return res.status(404).json({ error: 'Not found' });
  if (save.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    return res.json(save);
  }

  if (req.method === 'PATCH') {
    const { gameData, title, completed, seasonId } = req.body as {
      gameData?: unknown;
      title?: string;
      completed?: boolean;
      seasonId?: string | null;
    };

    const data: Prisma.GameSaveUncheckedUpdateInput = {};
    if (gameData !== undefined) data.gameData = gameData as Prisma.InputJsonValue;
    if (title !== undefined) data.title = title;
    if (completed !== undefined) data.completed = completed;
    if (seasonId !== undefined) data.seasonId = seasonId;

    const updated = await prisma.gameSave.update({ where: { id }, data });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.gameSave.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  res.status(405).end();
}
