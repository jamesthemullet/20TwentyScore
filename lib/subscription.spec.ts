import { getUserTier, getGameSaveCount } from './subscription';

const mockFindUnique = jest.fn();
const mockCount = jest.fn();

jest.mock('./prisma', () => ({
  prisma: {
    subscription: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
    gameSave: { count: (...args: unknown[]) => mockCount(...args) },
  },
}));

describe('getUserTier', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns "premium" when subscription status is "active"', async () => {
    mockFindUnique.mockResolvedValue({ status: 'active' });
    expect(await getUserTier('user-1')).toBe('premium');
  });

  it('returns "premium" when subscription status is "trialing"', async () => {
    mockFindUnique.mockResolvedValue({ status: 'trialing' });
    expect(await getUserTier('user-1')).toBe('premium');
  });

  it('returns "free" when subscription status is "canceled"', async () => {
    mockFindUnique.mockResolvedValue({ status: 'canceled' });
    expect(await getUserTier('user-1')).toBe('free');
  });

  it('returns "free" when subscription status is "past_due"', async () => {
    mockFindUnique.mockResolvedValue({ status: 'past_due' });
    expect(await getUserTier('user-1')).toBe('free');
  });

  it('returns "free" when no subscription record exists', async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await getUserTier('user-1')).toBe('free');
  });

  it('queries by the provided userId', async () => {
    mockFindUnique.mockResolvedValue(null);
    await getUserTier('user-abc');
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { userId: 'user-abc' },
      select: { status: true },
    });
  });
});

describe('getGameSaveCount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the count of game saves for the user', async () => {
    mockCount.mockResolvedValue(3);
    expect(await getGameSaveCount('user-1')).toBe(3);
  });

  it('queries by the provided userId', async () => {
    mockCount.mockResolvedValue(0);
    await getGameSaveCount('user-xyz');
    expect(mockCount).toHaveBeenCalledWith({ where: { userId: 'user-xyz' } });
  });
});
