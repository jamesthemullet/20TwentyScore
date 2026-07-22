import { stripe } from './stripe';
import { prisma } from './prisma';

type Plan = 'monthly' | 'annual' | 'unknown';

function getPlan(priceId: string): Plan {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID) return 'monthly';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID) return 'annual';
  return 'unknown';
}

export async function syncSubscriptionForUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) return;

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'active',
    limit: 1,
  });

  const sub = subscriptions.data[0];
  if (!sub) return;

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
}
