import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { requirePremium, requireSession } from './apiAuth';
import { getUserTier } from './subscription';

// next-auth/next pulls in jose and openid-client (ESM-only); mock the whole module
// so Jest does not attempt to parse it.
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('./authOptions', () => ({ authOptions: {} }));
jest.mock('./subscription', () => ({ getUserTier: jest.fn() }));

function mockRes() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as NextApiResponse;
  (res.status as jest.Mock).mockReturnValue(res);
  return res;
}

describe('lib/apiAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requireSession', () => {
    it('returns the session when one exists', async () => {
      const session = { user: { id: 'u1' } };
      (getServerSession as jest.Mock).mockResolvedValue(session);
      const res = mockRes();

      const result = await requireSession({} as NextApiRequest, res);

      expect(result).toBe(session);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns null and responds 401 when there is no session', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      const res = mockRes();

      const result = await requireSession({} as NextApiRequest, res);

      expect(result).toBeNull();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('requirePremium', () => {
    it('returns true without touching res for a premium-tier user', async () => {
      (getUserTier as jest.Mock).mockResolvedValue('premium');
      const res = mockRes();

      const result = await requirePremium('u1', res);

      expect(result).toBe(true);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns false and responds 402 PREMIUM_REQUIRED for a free-tier user', async () => {
      (getUserTier as jest.Mock).mockResolvedValue('free');
      const res = mockRes();

      const result = await requirePremium('u1', res);

      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith({ error: 'PREMIUM_REQUIRED' });
    });
  });
});
