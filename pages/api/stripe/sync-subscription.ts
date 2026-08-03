import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { syncSubscriptionForUser } from '../../../lib/syncSubscription';

type SyncSubscriptionResponse = { tier: 'free' | 'premium' } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SyncSubscriptionResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const session = await requireSession(req, res);
  if (!session) return;

  await syncSubscriptionForUser(session.user.id);
  const tier = await getUserTier(session.user.id);

  res.json({ tier });
}
