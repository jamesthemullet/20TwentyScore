import React from 'react';
import { render, screen } from '@testing-library/react';
import Index from '../pages/index';
import { NextRouter, useRouter } from 'next/router';
import { SessionContextValue, useSession } from 'next-auth/react';
import { MantineProvider } from '@mantine/core';

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    post: {
      findMany: jest.fn()
    }
  }))
}));

jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core');

  type MantineProviderProps = React.PropsWithChildren<unknown>;

  return {
    __esModule: true,
    ...originalModule,
    MantineProvider: ({ children }: MantineProviderProps) => <div>{children}</div>
  };
});

describe('Index page', () => {
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

    const session: SessionContextValue<boolean> = {
      update: jest.fn(),
      data: {
        user: {
          email: 'test@example.com'
        },
        expires: ''
      },
      status: 'authenticated'
    };
    (useSession as jest.Mock).mockReturnValue(session);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page', () => {
    render(
      <MantineProvider>
        <Index feed={[]} />
      </MantineProvider>
    );
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('20Twenty Score');
  });
});
