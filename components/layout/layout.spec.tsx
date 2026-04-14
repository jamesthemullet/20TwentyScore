import React from 'react';
import Layout from './layout';
import { render, screen } from '@testing-library/react';
import { NextRouter, useRouter } from 'next/router';

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

describe('Layout Component', () => {
  beforeEach(() => {
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
  });

  const LayoutProps = {
    children: <h2>Header</h2>
  };

  it('should render Layout component successfully', () => {
    render(<Layout>{LayoutProps.children}</Layout>);
    const headerElement = screen.getByRole('heading', { level: 2 });
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveTextContent('Header');
  });
});
