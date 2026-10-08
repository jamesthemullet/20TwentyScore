import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/saves/[id]';
import { requireSession } from '../../../lib/apiAuth';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/apiAuth', () => ({ requireSession: jest.fn() }));
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    gameSave: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
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

describe('pages/api/saves/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireSession as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
  });

  it('does nothing further when there is no session', async () => {
    (requireSession as jest.Mock).mockResolvedValue(null);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.findUnique).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns 400 when id is missing', async () => {
    const req = mockReq({ method: 'GET', query: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(prisma.gameSave.findUnique).not.toHaveBeenCalled();
  });

  it('accepts an array query id by using its first value', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const req = mockReq({ method: 'GET', query: { id: ['s1', 's2'] } });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.findUnique).toHaveBeenCalledWith({ where: { id: 's1' } });
  });

  it('returns 404 when the save does not exist', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue(null);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('returns 403 when the save belongs to another user', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'someone-else' });
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });

  it('GET returns the save when it belongs to the authenticated user', async () => {
    const save = { id: 's1', userId: 'u1', title: 'My save' };
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue(save);
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(save);
  });

  it('PATCH updates only the fields provided in the body', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const updated = { id: 's1', title: 'New title' };
    (prisma.gameSave.update as jest.Mock).mockResolvedValue(updated);
    const req = mockReq({ method: 'PATCH', body: { title: 'New title' } });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { title: 'New title' },
    });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('PATCH forwards gameData, completed, and seasonId when all are provided', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const updated = { id: 's1' };
    (prisma.gameSave.update as jest.Mock).mockResolvedValue(updated);
    const req = mockReq({
      method: 'PATCH',
      body: { gameData: { foo: 'bar' }, completed: true, seasonId: 'season1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { gameData: { foo: 'bar' }, completed: true, seasonId: 'season1' },
    });
  });

  it('PATCH allows clearing seasonId by setting it to null', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    (prisma.gameSave.update as jest.Mock).mockResolvedValue({ id: 's1' });
    const req = mockReq({ method: 'PATCH', body: { seasonId: null } });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { seasonId: null },
    });
  });

  it('DELETE removes the save and returns 204', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const req = mockReq({ method: 'DELETE' });
    const res = mockRes();

    await handler(req, res);

    expect(prisma.gameSave.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('rejects unsupported methods', async () => {
    (prisma.gameSave.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'u1' });
    const req = mockReq({ method: 'POST' });
    const res = mockRes();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, PATCH, DELETE');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });
});
