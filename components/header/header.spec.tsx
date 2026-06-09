import { render, screen } from '@testing-library/react';
import { type NextRouter, useRouter } from 'next/router';
import Header from './header';

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' })
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
    const siteTitle = screen.getByText('20Twenty Score');
    expect(siteTitle).toBeInTheDocument();
  });
});
