import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/stripe/create-portal-session';
import { requireSession } from '../../../lib/apiAuth';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/apiAuth', () => ({ requireSession: jest.fn() }));
jest.mock('../../../lib/stripe', () => ({
  stripe: { billingPortal: { sessions: { create: jest.fn() } } },
}));
jest.mock('../../../lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

function mockReq(overrides: Partial<NextApiRequest> = {}) {
  return { method: 'POST', ...overrides } as unknown as NextApiRequest;
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

describe('pages/api/stripe/create-portal-session', () => {
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXTAUTH_URL = 'https://example.com';
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

  it('returns 400 when the user has no stripeCustomerId', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', stripeCustomerId: null });
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No billing account found' });
    expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
  });

  it('returns 400 when the user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No billing account found' });
  });

  it('creates a billing portal session and returns its url', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', stripeCustomerId: 'cus_123' });
    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({ url: 'https://billing.stripe.com/session/abc' });
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'https://example.com/account',
    });
    expect(res.json).toHaveBeenCalledWith({ url: 'https://billing.stripe.com/session/abc' });
  });
});
