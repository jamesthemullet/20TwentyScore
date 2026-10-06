import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/seasons/[id]';
import { requireSession } from '../../../lib/apiAuth';
import { getUserTier } from '../../../lib/subscription';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/apiAuth', () => ({ requireSession: jest.fn() }));
jest.mock('../../../lib/subscription', () => ({ getUserTier: jest.fn() }));
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    season: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
    gameSave: { findMany: jest.fn() },
  },
}));

function mockReq(overrides: Partial<NextApiRequest> = {}) {
  return { query: { id: 's1' }, ...overrides } as unknown as NextApiRequest;
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

describe('pages/api/seasons/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    (getUserTier as jest.Mock).mockResolvedValue('premium');
  });

  it('does nothing further when there is no session', async () => {
    (requireSession as jest.Mock).mockResolvedValue(null);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(getUserTier).not.toHaveBeenCalled();
    expect(prisma.season.findUnique).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns 402 PREMIUM_REQUIRED for a free-tier user', async () => {
    (getUserTier as jest.Mock).mockResolvedValue('free');
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({ error: 'PREMIUM_REQUIRED' });
    expect(prisma.season.findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 when id is missing', async () => {
    const req = mockReq({ method: 'GET', query: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(prisma.season.findUnique).not.toHaveBeenCalled();
  });

  it('accepts an array query id by using its first value', async () => {
    (prisma.season.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    (prisma.gameSave.findMany as jest.Mock).mockResolvedValue([]);
    const req = mockReq({ method: 'GET', query: { id: ['s1', 's2'] } });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.season.findUnique).toHaveBeenCalledWith({ where: { id: 's1' } });
  });

  it('returns 404 when the season does not exist', async () => {
    (prisma.season.findUnique as jest.Mock).mockResolvedValue(null);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('returns 403 when the season belongs to another user', async () => {
    (prisma.season.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'someone-else' });
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });

  it('GET returns the season with its game saves when it belongs to the authenticated user', async () => {
    const season = { id: 's1', userId: 'u1', name: 'Summer 2026' };
    const saves = [{ id: 'gs1', title: 'Game 1', createdAt: new Date('2026-01-01'), completed: true, seasonId: 's1' }];
    (prisma.season.findUnique as jest.Mock).mockResolvedValue(season);
    (prisma.gameSave.findMany as jest.Mock).mockResolvedValue(saves);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.findMany).toHaveBeenCalledWith({
      where: { seasonId: 's1' },
      select: { id: true, title: true, createdAt: true, completed: true, seasonId: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(res.json).toHaveBeenCalledWith({ ...season, gameSaves: saves });
  });

  it('PATCH updates only the fields provided in the body', async () => {
    (prisma.season.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const updated = { id: 's1', name: 'New name' };
    (prisma.season.update as jest.Mock).mockResolvedValue(updated);
    const req = mockReq({ method: 'PATCH', body: { name: 'New name' } });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.season.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { name: 'New name' },
    });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('PATCH forwards both name and description when provided', async () => {
    (prisma.season.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const updated = { id: 's1' };
    (prisma.season.update as jest.Mock).mockResolvedValue(updated);
    const req = mockReq({
      method: 'PATCH',
      body: { name: 'New name', description: 'New description' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.season.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { name: 'New name', description: 'New description' },
    });
  });

  it('DELETE removes the season and returns 204', async () => {
    (prisma.season.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const req = mockReq({ method: 'DELETE' });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.season.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('rejects unsupported methods', async () => {
    (prisma.season.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const req = mockReq({ method: 'POST' });
    const res = mockRes();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, PATCH, DELETE');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });
});
