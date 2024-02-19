import React from 'react';
import Nav from './nav';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextRouter, useRouter } from 'next/router';
import { SessionContextValue, useSession } from 'next-auth/react';
import { matchers } from '@emotion/jest';

expect.extend(matchers);

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Nav Component', () => {
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

  it('should render a Nav component successfully', () => {
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

    render(<Nav />);

    expect(screen.getByText('Home')).toBeVisible();
    expect(screen.getByText('Teams')).toBeVisible();
    expect(screen.getByText('Scoreboard')).toBeVisible();
    expect(screen.getByText('(test@example.com)')).toBeVisible();
    expect(screen.getByAltText('Save Game')).toBeVisible();
  });

  it('should not show the user email if the user is not authenticated', () => {
    const session: SessionContextValue<boolean> = {
      update: jest.fn(),
      data: null,
      status: 'unauthenticated'
    };
    (useSession as jest.Mock).mockReturnValue(session);

    render(<Nav />);

    expect(screen.queryByText('(test@example.com)')).not.toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeVisible();
  });

  it('should toggle the dropdown menu when the burger button is clicked', async () => {
    const session: SessionContextValue<boolean> = {
      update: jest.fn(),
      data: null,
      status: 'unauthenticated'
    };
    (useSession as jest.Mock).mockReturnValue(session);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 150
    });
    window.dispatchEvent(new Event('resize'));
    render(<Nav />);

    const expandedMenu = screen.getByLabelText('Expanded Menu');
    expect(expandedMenu).not.toHaveClass('open');

    const burgerButton = screen.getByLabelText('Navigation Menu');

    act(() => {
      fireEvent.click(burgerButton);
    });

    expect(expandedMenu).toHaveClass('open');
  });

  it('should save the game when the save game icon is clicked', () => {
    const session: SessionContextValue<boolean> = {
      update: jest.fn(),
      data: null,
      status: 'unauthenticated'
    };
    (useSession as jest.Mock).mockReturnValue(session);

    render(<Nav />);

    const saveGameIcon = screen.getByAltText('Save Game');

    act(() => {
      fireEvent.click(saveGameIcon);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
});
