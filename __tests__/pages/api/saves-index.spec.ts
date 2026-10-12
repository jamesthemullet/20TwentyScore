import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/saves/index';
import { requireSession } from '../../../lib/apiAuth';
import { getGameSaveCount, getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/apiAuth', () => ({ requireSession: jest.fn() }));
jest.mock('../../../lib/subscription', () => ({
  getUserTier: jest.fn(),
  getGameSaveCount: jest.fn(),
}));
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    gameSave: { findMany: jest.fn(), create: jest.fn() },
  },
}));

function mockReq(overrides: Partial<NextApiRequest> = {}) {
  return { ...overrides } as NextApiRequest;
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

describe('pages/api/saves/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
  });

  it('does nothing further when there is no session', async () => {
    (requireSession as jest.Mock).mockResolvedValue(null);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.findMany).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('GET returns the saves for the authenticated user', async () => {
    const saves = [{ id: 's1', title: 'My save', createdAt: new Date(), completed: false, seasonId: null }];
    (prisma.gameSave.findMany as jest.Mock).mockResolvedValue(saves);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      select: { id: true, title: true, createdAt: true, completed: true, seasonId: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(res.json).toHaveBeenCalledWith(saves);
  });

  it('POST rejects a free-tier user who has reached the save limit', async () => {
    (getUserTier as jest.Mock).mockResolvedValue('free');
    (getGameSaveCount as jest.Mock).mockResolvedValue(1);
    const req = mockReq({ method: 'POST', body: { gameData: { foo: 'bar' } } });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({ error: 'FREE_LIMIT_REACHED' });
    expect(prisma.gameSave.create).not.toHaveBeenCalled();
  });

  it('POST creates a save for a free-tier user under the limit', async () => {
    (getUserTier as jest.Mock).mockResolvedValue('free');
    (getGameSaveCount as jest.Mock).mockResolvedValue(0);
    const created = { id: 's2' };
    (prisma.gameSave.create as jest.Mock).mockResolvedValue(created);
    const req = mockReq({ method: 'POST', body: { gameData: { foo: 'bar' }, title: 'Title', seasonId: 'season1' } });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.create).toHaveBeenCalledWith({
      data: { userId: 'u1', gameData: { foo: 'bar' }, title: 'Title', seasonId: 'season1' },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('POST creates a save for a premium-tier user without checking the save count', async () => {
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const created = { id: 's3' };
    (prisma.gameSave.create as jest.Mock).mockResolvedValue(created);
    const req = mockReq({ method: 'POST', body: { gameData: { foo: 'bar' } } });
    const res = mockRes();

    await handler(req, res);

    expect(getGameSaveCount).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('POST rejects a request with no gameData', async () => {
    (getUserTier as jest.Mock).mockResolvedValue('premium');
    const req = mockReq({ method: 'POST', body: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'gameData is required' });
    expect(prisma.gameSave.create).not.toHaveBeenCalled();
  });

  it('rejects unsupported methods', async () => {
    const req = mockReq({ method: 'DELETE' });
    const res = mockRes();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });
});
