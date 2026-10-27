import nextConfig from '../next.config.js';

describe('next.config.js headers', () => {
  it('sets the expected security headers on every route', async () => {
    const [{ source, headers }] = await nextConfig.headers();

    expect(source).toBe('/(.*)');
    const byKey = Object.fromEntries(headers.map(({ key, value }: { key: string; value: string }) => [key, value]));

    expect(byKey['X-Frame-Options']).toBe('DENY');
    expect(byKey['X-Content-Type-Options']).toBe('nosniff');
    expect(byKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(byKey['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains; preload');
    expect(byKey['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()');
    expect(byKey['Content-Security-Policy']).toContain("default-src 'self'");
  });
});
