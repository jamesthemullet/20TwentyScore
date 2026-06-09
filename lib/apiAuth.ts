import { getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { authOptions } from './authOptions';

export async function requireSession(req: NextApiRequest, res: NextApiResponse): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return session;
}
