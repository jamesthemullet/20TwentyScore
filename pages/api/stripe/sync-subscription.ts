import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSession } from '../../../lib/apiAuth';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';

type Plan = 'monthly' | 'annual' | 'unknown';

function getPlan(priceId: string): Plan {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID) return 'monthly';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID) return 'annual';
  return 'unknown';
}

type SyncSubscriptionResponse = { tier: 'free' | 'premium' } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SyncSubscriptionResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer' });

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'active',
    limit: 1,
  });

  const sub = subscriptions.data[0];
  if (!sub) return res.json({ tier: 'free' });

  const priceId = sub.items.data[0].price.id;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      plan: getPlan(priceId),
    },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      plan: getPlan(priceId),
    },
  });

  res.json({ tier: 'premium' });
}
