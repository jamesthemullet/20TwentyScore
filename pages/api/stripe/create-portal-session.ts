import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSession } from '../../../lib/apiAuth';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) {
    return res.status(400).json({ error: 'No billing account found' });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/account`,
  });

  res.json({ url: portalSession.url });
}
