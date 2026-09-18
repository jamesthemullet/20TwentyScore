import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PageDocument from '../../pages/_document';

// pages/_document.tsx renders next/document's <Html>/<Head>/<Main>/<NextScript>, which read
// from a DocumentContext only Next.js's own page-rendering pipeline provides. Mocking them as
// their real HTML equivalents and rendering to a markup string (rather than into jsdom) lets us
// assert on the structure without needing that context or hitting React 19's DOM singleton
// hoisting behaviour for <html>/<head>/<body>.
jest.mock('next/document', () => ({
  Html: ({ children, lang }: { children: ReactNode; lang: string }) => (
    <html lang={lang}>{children}</html>
  ),
  // biome-ignore lint/style/noHeadElement: mocking next/document's <Head> as a real <head> for the markup assertions below
  Head: ({ children }: { children: ReactNode }) => <head>{children}</head>,
  Main: () => <div id="__next" />,
  NextScript: () => <script data-testid="next-script" />,
}));

function renderDocument(): Document {
  const parser = new DOMParser();
  return parser.parseFromString(renderToStaticMarkup(<PageDocument />), 'text/html');
}

describe('Document (_document.tsx)', () => {
  it('sets the document language to English', () => {
    const doc = renderDocument();
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
  });

  it('preconnects to the Google Fonts hosts used by the stylesheet link', () => {
    const doc = renderDocument();
    const hrefs = Array.from(doc.querySelectorAll('link[rel="preconnect"]')).map((link) =>
      link.getAttribute('href')
    );
    expect(hrefs).toEqual(
      expect.arrayContaining(['https://fonts.googleapis.com', 'https://fonts.gstatic.com'])
    );
  });

  it('loads the Bodoni Moda, Inter, and JetBrains Mono font families', () => {
    const doc = renderDocument();
    const href = doc.querySelector('link[rel="stylesheet"]')?.getAttribute('href');
    expect(href).toEqual(expect.stringContaining('family=Bodoni+Moda'));
    expect(href).toEqual(expect.stringContaining('family=Inter'));
    expect(href).toEqual(expect.stringContaining('family=JetBrains+Mono'));
  });

  it('renders Main and NextScript inside the body', () => {
    const doc = renderDocument();
    expect(doc.body.querySelector('#__next')).not.toBeNull();
    expect(doc.body.querySelector('[data-testid="next-script"]')).not.toBeNull();
  });
});
