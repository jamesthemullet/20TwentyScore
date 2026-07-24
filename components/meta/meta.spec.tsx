import { render } from '@testing-library/react';
import { type NextRouter, useRouter } from 'next/router';
import type React from 'react';
import Meta from './meta';

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>;
    }
  };
});

useRouterMock.mockReturnValue({
  basePath: '',
  isLocaleDomain: false,
  asPath: '/',
  push: async () => true,
  replace: async () => true,
  reload: () => null,
  back: () => null,
  prefetch: async () => null,
  beforePopState: () => null,
  isFallback: false,
  events: {
    on: () => null,
    off: () => null,
    emit: () => null
  },
  isReady: true,
  isPreview: false
} as unknown as NextRouter);

describe('Meta', () => {
  it('should set relevant meta tags', () => {
    render(<Meta />);
    const ogUrlMetaTag = document.querySelector('meta[property="og:url"]');
    expect(ogUrlMetaTag).toBeTruthy();
    expect(ogUrlMetaTag?.getAttribute('content')).toBe('https://20-twenty-score.vercel.app/');
    const ogUrlMetaDescription = document.querySelector('meta[property="og:description"]');
    expect(ogUrlMetaDescription).toBeTruthy();
    expect(ogUrlMetaDescription?.getAttribute('content')).toBe(
      'Track your T20 cricket match ball by ball — runs, wickets, extras, and live run rates.'
    );
    expect(document.title).toBe('20Twenty Score');
  });
});
