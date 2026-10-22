/**
 * Shared Playwright fixture.
 *
 * Every test using this `test` fails if the page throws an uncaught error or
 * the browser reports a Content-Security-Policy violation. A CSP that blocks
 * Next.js's inline bootstrap script stops the app hydrating, which leaves the
 * page rendered but with every button dead — this catches that directly.
 */

import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) {
          errors.push(`CSP violation: ${msg.text()}`);
        }
      });
      await use(errors);
      expect(errors, 'page errors / CSP violations').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
