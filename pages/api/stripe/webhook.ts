import type { NextApiRequest, NextApiResponse } from 'next';
import type Stripe from 'stripe';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';
import { requireEnv } from '../../../lib/env';

export const config = { api: { bodyParser: false } };

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

type Plan = 'monthly' | 'annual' | 'unknown';

function getPlan(priceId: string): Plan {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID) return 'monthly';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID) return 'annual';
  return 'unknown';
}

type WebhookResponse = { received: boolean } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<WebhookResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, requireEnv('STRIPE_WEBHOOK_SECRET'));
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
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
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status,
            stripePriceId: priceId,
            plan: getPlan(priceId),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'canceled' },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (!subId) break;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subId },
          data: { status: 'past_due' },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
