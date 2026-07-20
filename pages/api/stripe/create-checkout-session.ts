import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSession } from '../../../lib/apiAuth';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';

type CheckoutSessionResponse = { url: string | null } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<CheckoutSessionResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const { priceId } = req.body as { priceId: string };
  if (!priceId) return res.status(400).json({ error: 'priceId is required' });

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  let customerId = user.stripeCustomerId;
  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch {
      customerId = null;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: null } });
    }
  }
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/account`,
    metadata: { userId },
  });

  res.json({ url: checkoutSession.url });
}
