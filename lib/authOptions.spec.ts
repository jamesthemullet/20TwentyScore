jest.mock('./prisma', () => ({ prisma: {} }));
jest.mock('@next-auth/prisma-adapter', () => ({ PrismaAdapter: jest.fn(() => ({})) }));

describe('authOptions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXTAUTH_SECRET: 'test-secret',
      GOOGLE_CLIENT_ID: 'id',
      GOOGLE_CLIENT_SECRET: 'secret',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('exposes NEXTAUTH_SECRET as secret, since NextAuth cannot assign it through the Proxy', async () => {
    const { authOptions } = await import('./authOptions');
    expect(authOptions.secret).toBe('test-secret');
  });
});
