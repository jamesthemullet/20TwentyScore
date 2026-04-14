import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextRouter, useRouter } from 'next/router';
import Header from './header';

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

describe('Header Component', () => {
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
  it('should render a Header component successfully', () => {
    render(<Header />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('20Twenty Score');
  });
});
