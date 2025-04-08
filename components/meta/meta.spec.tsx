import React from 'react';
import { render } from '@testing-library/react';
import Meta from './meta';
import { NextRouter, useRouter } from 'next/router';

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
    const { container } = render(<Meta />);
    const ogUrlMetaTag = container.querySelector('meta[property="og:url"]');
    expect(ogUrlMetaTag).toBeTruthy();
    expect(ogUrlMetaTag?.getAttribute('content')).toBe('https://20-twenty-score.vercel.app/');
    const ogUrlMetaDescription = container.querySelector('meta[property="og:description"]');
    expect(ogUrlMetaDescription).toBeTruthy();
    expect(ogUrlMetaDescription?.getAttribute('content')).toBe(
      '20 Twenty Scorecard - keep scores of your 20 Twenty games'
    );
    expect(document.title).toBe('20Twenty Scorecard');
  });
});
