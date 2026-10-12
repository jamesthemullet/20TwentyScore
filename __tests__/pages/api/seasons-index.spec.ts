import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import handler from '../../../pages/api/seasons/index';
import { getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

// next-auth/next pulls in jose and openid-client (ESM-only); mock the whole module
// so Jest does not attempt to parse it.
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('../../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../../lib/prisma', () => ({
  prisma: { season: { findMany: jest.fn(), create: jest.fn() } },
}));

function createMocks(method: string, options: { body?: unknown; query?: Record<string, string> } = {}) {
  const req = { method, body: options.body ?? {}, query: options.query ?? {} } as unknown as NextApiRequest;
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse;
  (res.status as jest.Mock).mockReturnValue(res);
  return { req, res };
}

describe('pages/api/seasons/index', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 and does not touch the database when there is no session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const { req, res } = createMocks('GET');

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(prisma.season.findMany).not.toHaveBeenCalled();
  });

  it('returns 402 PREMIUM_REQUIRED for a free-tier user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('free');
    const { req, res } = createMocks('GET');

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({ error: 'PREMIUM_REQUIRED' });
    expect(prisma.season.findMany).not.toHaveBeenCalled();
  });

  it('GET returns seasons for the signed-in premium user mapped to gameCount', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    (prisma.season.findMany as jest.Mock).mockResolvedValue([
      {
        id: 's1',
        userId: 'u1',
        name: 'Summer 2026',
        description: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        _count: { gameSaves: 3 },
      },
    ]);
    const { req, res } = createMocks('GET');

    await handler(req, res);

    expect(prisma.season.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      include: { _count: { select: { gameSaves: true } } },
      orderBy: { createdAt: 'desc' },
    });
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ id: 's1', name: 'Summer 2026', gameCount: 3 }),
    ]);
  });

  it('POST creates a season for the signed-in premium user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const created = { id: 's2', userId: 'u1', name: 'Winter 2026', description: 'Indoor league' };
    (prisma.season.create as jest.Mock).mockResolvedValue(created);
    const { req, res } = createMocks('POST', { body: { name: 'Winter 2026', description: 'Indoor league' } });

    await handler(req, res);

    expect(prisma.season.create).toHaveBeenCalledWith({
      data: { userId: 'u1', name: 'Winter 2026', description: 'Indoor league' },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('POST without a name returns 400 and does not create a season', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const { req, res } = createMocks('POST', { body: {} });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'name is required' });
    expect(prisma.season.create).not.toHaveBeenCalled();
  });

  it('returns 405 for unsupported methods', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const { req, res } = createMocks('DELETE');

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });
});
