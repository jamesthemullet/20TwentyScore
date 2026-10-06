import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/account/index';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/apiAuth', () => ({ requireSession: jest.fn() }));
jest.mock('../../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    subscription: { findUnique: jest.fn() },
  },
}));

function mockRes() {
  return { json: jest.fn() } as unknown as NextApiResponse;
}

describe('pages/api/account/index', () => {
  const req = {} as NextApiRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing further when there is no session', async () => {
    (requireSession as jest.Mock).mockResolvedValue(null);
    const res = mockRes();

    await handler(req, res);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.subscription.findUnique).not.toHaveBeenCalled();
    expect(getUserTier).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns the user, subscription, and tier for an authenticated user', async () => {
    (requireSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    const user = { id: 'u1', name: 'Jamie' };
    const subscription = { userId: 'u1', status: 'active' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const res = mockRes();

    await handler(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(prisma.subscription.findUnique).toHaveBeenCalledWith({ where: { userId: 'u1' } });
    expect(getUserTier).toHaveBeenCalledWith('u1');
    expect(res.json).toHaveBeenCalledWith({ user, subscription, tier: 'premium' });
  });

  it('returns null user/subscription for an authenticated user with neither', async () => {
    (requireSession as jest.Mock).mockResolvedValue({ user: { id: 'u2' } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);
    (getUserTier as jest.Mock).mockResolvedValue('free');
    const res = mockRes();

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({ user: null, subscription: null, tier: 'free' });
  });
});
