import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/stripe/create-checkout-session';
import { requireSession } from '../../../lib/apiAuth';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/apiAuth', () => ({ requireSession: jest.fn() }));
jest.mock('../../../lib/stripe', () => ({
  stripe: {
    customers: { retrieve: jest.fn(), create: jest.fn() },
    checkout: { sessions: { create: jest.fn() } },
  },
}));
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

function mockReq(overrides: Partial<NextApiRequest> = {}) {
  return { method: 'POST', body: { priceId: 'price_123' }, ...overrides } as unknown as NextApiRequest;
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

describe('pages/api/stripe/create-checkout-session', () => {
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXTAUTH_URL = 'https://example.test';
    (requireSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
  });

  afterAll(() => {
    process.env.NEXTAUTH_URL = originalNextAuthUrl;
  });

  it('rejects non-POST methods', async () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
    expect(requireSession).not.toHaveBeenCalled();
  });

  it('does nothing further when there is no session', async () => {
    (requireSession as jest.Mock).mockResolvedValue(null);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns 400 when priceId is missing', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'priceId is required' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 when the authenticated user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('reuses an existing valid Stripe customer without creating a new one', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'jamie@example.com',
      name: 'Jamie',
      stripeCustomerId: 'cus_existing',
    });
    (stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_existing' });
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({ url: 'https://checkout.example/session' });
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(stripe.customers.retrieve).toHaveBeenCalledWith('cus_existing');
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_existing',
      mode: 'subscription',
      line_items: [{ price: 'price_123', quantity: 1 }],
      success_url: 'https://example.test/dashboard?checkout=success',
      cancel_url: 'https://example.test/account',
      metadata: { userId: 'u1' },
    });
    expect(res.json).toHaveBeenCalledWith({ url: 'https://checkout.example/session' });
  });

  it('creates a new Stripe customer when the stored customer id is stale', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'jamie@example.com',
      name: 'Jamie',
      stripeCustomerId: 'cus_stale',
    });
    (stripe.customers.retrieve as jest.Mock).mockRejectedValue(new Error('No such customer'));
    (stripe.customers.create as jest.Mock).mockResolvedValue({ id: 'cus_new' });
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({ url: 'https://checkout.example/session' });
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(prisma.user.update).toHaveBeenNthCalledWith(1, { where: { id: 'u1' }, data: { stripeCustomerId: null } });
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: 'jamie@example.com',
      name: 'Jamie',
      metadata: { userId: 'u1' },
    });
    expect(prisma.user.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'u1' },
      data: { stripeCustomerId: 'cus_new' },
    });
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_new' }),
    );
  });

  it('creates a new Stripe customer when the user has none, falling back to no name', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'jamie@example.com',
      name: null,
      stripeCustomerId: null,
    });
    (stripe.customers.create as jest.Mock).mockResolvedValue({ id: 'cus_new' });
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({ url: 'https://checkout.example/session' });
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(stripe.customers.retrieve).not.toHaveBeenCalled();
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: 'jamie@example.com',
      name: undefined,
      metadata: { userId: 'u1' },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { stripeCustomerId: 'cus_new' } });
    expect(res.json).toHaveBeenCalledWith({ url: 'https://checkout.example/session' });
  });
});
