import { getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { authOptions } from './authOptions';
import { getUserTier } from './subscription';

export async function requireSession(req: NextApiRequest, res: NextApiResponse): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return session;
}

export async function requirePremium(userId: string, res: NextApiResponse): Promise<boolean> {
  const tier = await getUserTier(userId);
  if (tier === 'free') {
    res.status(402).json({ error: 'PREMIUM_REQUIRED' });
    return false;
  }
  return true;
}
