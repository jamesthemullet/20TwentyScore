import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/stripe/sync-subscription';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { syncSubscriptionForUser } from '../../../lib/syncSubscription';

jest.mock('../../../lib/apiAuth', () => ({ requireSession: jest.fn() }));
jest.mock('../../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../../lib/syncSubscription', () => ({ syncSubscriptionForUser: jest.fn() }));

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

describe('pages/api/stripe/sync-subscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (syncSubscriptionForUser as jest.Mock).mockResolvedValue(undefined);
    (getUserTier as jest.Mock).mockResolvedValue('free');
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

    expect(syncSubscriptionForUser).not.toHaveBeenCalled();
    expect(getUserTier).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('syncs the subscription and returns the free tier', async () => {
    (getUserTier as jest.Mock).mockResolvedValue('free');
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(syncSubscriptionForUser).toHaveBeenCalledWith('u1');
    expect(getUserTier).toHaveBeenCalledWith('u1');
    expect(res.json).toHaveBeenCalledWith({ tier: 'free' });
  });

  it('syncs the subscription and returns the premium tier', async () => {
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({ tier: 'premium' });
  });
});
