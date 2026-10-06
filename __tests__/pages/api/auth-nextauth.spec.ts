const mockNextAuth = jest.fn().mockReturnValue('nextauth-handler');

jest.mock('next-auth', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockNextAuth(...args),
}));

jest.mock('../../../lib/authOptions', () => ({
  authOptions: { mocked: true },
}));

describe('pages/api/auth/[...nextauth]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('configures NextAuth with authOptions', async () => {
    await import('../../../pages/api/auth/[...nextauth]');
    expect(mockNextAuth).toHaveBeenCalledWith({ mocked: true });
  });

  it('exports the NextAuth handler as the default export', async () => {
    const route = await import('../../../pages/api/auth/[...nextauth]');
    expect(route.default).toBe('nextauth-handler');
  });
});
