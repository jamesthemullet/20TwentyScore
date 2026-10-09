import { EventEmitter } from 'node:events';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/stripe/webhook';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: jest.fn() },
    subscriptions: { retrieve: jest.fn() },
  },
}));
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    subscription: { upsert: jest.fn(), update: jest.fn() },
  },
}));

function mockReq(overrides: Partial<NextApiRequest> = {}): NextApiRequest {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    ...overrides,
  }) as unknown as NextApiRequest;
}

function mockRes() {
  const res = {
    json: jest.fn(),
    status: jest.fn(),
    setHeader: jest.fn(),
    end: jest.fn(),
  } as unknown as NextApiResponse;
  (res.status as jest.Mock).mockReturnValue(res);
  return res;
}

async function sendBody(req: NextApiRequest, handlerPromise: Promise<unknown>, body = '{}') {
  (req as unknown as EventEmitter).emit('data', Buffer.from(body));
  (req as unknown as EventEmitter).emit('end');
  await handlerPromise;
}

describe('pages/api/stripe/webhook', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID = 'price_monthly';
    process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID = 'price_annual';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects non-POST methods', async () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });

  it('returns 400 when the stripe-signature header is missing', async () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing stripe-signature header' });
    expect(stripe.webhooks.constructEvent).not.toHaveBeenCalled();
  });

  it('returns 400 when signature verification fails', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('invalid signature');
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Webhook signature verification failed: Error: invalid signature' });
  });

  it('upserts a subscription on checkout.session.completed, mapping the monthly plan', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'u1' }, subscription: 'sub_123' } },
    });
    (stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue({
      id: 'sub_123',
      status: 'active',
      items: { data: [{ price: { id: 'price_monthly' } }] },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_123');
    expect(prisma.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      create: { userId: 'u1', stripeSubscriptionId: 'sub_123', stripePriceId: 'price_monthly', status: 'active', plan: 'monthly' },
      update: { stripeSubscriptionId: 'sub_123', stripePriceId: 'price_monthly', status: 'active', plan: 'monthly' },
    });
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('maps an unrecognized price id to the "unknown" plan on checkout.session.completed', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'u1' }, subscription: 'sub_123' } },
    });
    (stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue({
      id: 'sub_123',
      status: 'active',
      items: { data: [{ price: { id: 'price_other' } }] },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ plan: 'unknown' }) }),
    );
  });

  it('skips checkout.session.completed when there is no userId in metadata', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: {}, subscription: 'sub_123' } },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
    expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('skips checkout.session.completed when there is no subscription on the session', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'u1' }, subscription: null } },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
    expect(prisma.subscription.upsert).not.toHaveBeenCalled();
  });

  it('updates the subscription plan/status on customer.subscription.updated', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_123', status: 'past_due', items: { data: [{ price: { id: 'price_annual' } }] } } },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_123' },
      data: { status: 'past_due', stripePriceId: 'price_annual', plan: 'annual' },
    });
  });

  it('marks the subscription canceled on customer.subscription.deleted', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_123' } },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_123' },
      data: { status: 'canceled' },
    });
  });

  it('marks the subscription past_due on invoice.payment_failed with a string subscription ref', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { parent: { subscription_details: { subscription: 'sub_123' } } } },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_123' },
      data: { status: 'past_due' },
    });
  });

  it('marks the subscription past_due on invoice.payment_failed with an expanded subscription object', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { parent: { subscription_details: { subscription: { id: 'sub_123' } } } } },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_123' },
      data: { status: 'past_due' },
    });
  });

  it('skips invoice.payment_failed when there is no subscription reference', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { parent: {} } },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('acknowledges an event type it does not handle', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.created',
      data: { object: {} },
    });
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('returns 500 when handling the event throws', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_123' } },
    });
    (prisma.subscription.update as jest.Mock).mockRejectedValue(new Error('db down'));
    const req = mockReq();
    const res = mockRes();

    const handlerPromise = handler(req, res);
    await sendBody(req, handlerPromise);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Webhook handler failed' });
    expect(console.error).toHaveBeenCalledWith('Webhook handler error:', expect.any(Error));
  });
});
