import React from 'react';
import Nav from './nav';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextRouter, useRouter } from 'next/router';
import { SessionContextValue, useSession } from 'next-auth/react';
import { matchers } from '@emotion/jest';
import { GameScore, GameScoreContext } from '../../context/GameScoreContext';
import defaultPlayers from '../core/players';

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
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const setGameScore = jest.fn();
const gameScore = [
  {
    players: [],
    name: 'Team 1',
    index: 0,
    totalRuns: 0,
    totalWicketsConceded: 0,
    totalWicketsTaken: 0,
    overs: 0,
    currentBattingTeam: true,
    currentBowlingTeam: false,
    finishedBatting: false
  },
  {
    players: [],
    name: 'Team 2',
    index: 1,
    totalRuns: 0,
    totalWicketsConceded: 0,
    totalWicketsTaken: 0,
    overs: 0,
    currentBattingTeam: false,
    currentBowlingTeam: true,
    finishedBatting: false
  }
] as GameScore;
const setPlayerScore = jest.fn();
const swapBatsmen = jest.fn();

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the user is logged in', () => {
    beforeEach(() => {
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
    it('should render a Nav component successfully', () => {
      render(<Nav />);

      expect(screen.getByText('Home')).toBeVisible();
      expect(screen.getByText('Teams')).toBeVisible();
      expect(screen.getByText('Scoreboard')).toBeVisible();
      // expect(screen.getByText('(test@example.com)')).toBeVisible();
      expect(screen.getByAltText('Save Game')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Load Game' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'New Game' })).toBeVisible();
    });

    it('should save the game when the save game icon is clicked', () => {
      render(<Nav />);

      const saveGameIcon = screen.getByAltText('Save Game');

      act(() => {
        fireEvent.click(saveGameIcon);
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load a game from local storage when the load game button is clicked', () => {
      localStorageMock.getItem.mockReturnValueOnce(
        '[{"team1Players": [{"name": "Player 1"}], "name": "Team 1", "index": 0}, {"team2Players": [{"name": "Player 1"}], "name": "Team 2", "index": 1}]'
      );

      render(
        <GameScoreContext.Provider
          value={{
            setGameScore,
            gameScore,
            setPlayerScore,
            swapBatsmen
          }}>
          <Nav />
        </GameScoreContext.Provider>
      );

      const loadGameButton = screen.getByRole('button', { name: 'Load Game' });

      act(() => {
        fireEvent.click(loadGameButton);
      });

      expect(localStorageMock.getItem).toHaveBeenCalledWith('gameData');
      expect(setGameScore).toHaveBeenCalledWith(
        JSON.parse(
          '[{"team1Players": [{"name": "Player 1"}], "name": "Team 1", "index": 0}, {"team2Players": [{"name": "Player 1"}], "name": "Team 2", "index": 1}]'
        )
      );
      expect(screen.queryByRole('button', { name: 'Load Game' })).not.toBeInTheDocument();
    });

    it('should not load a game from local storage when there is no game data', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      render(
        <GameScoreContext.Provider
          value={{
            setGameScore,
            gameScore,
            setPlayerScore,
            swapBatsmen
          }}>
          <Nav />
        </GameScoreContext.Provider>
      );

      const loadGameButton = screen.getByRole('button', { name: 'Load Game' });

      act(() => {
        fireEvent.click(loadGameButton);
      });

      expect(localStorageMock.getItem).toHaveBeenCalledWith('gameData');
      expect(setGameScore).not.toHaveBeenCalled();
    });
  });
  describe('when the user is not logged in', () => {
    beforeEach(() => {
      const session: SessionContextValue<boolean> = {
        update: jest.fn(),
        data: null,
        status: 'unauthenticated'
      };
      (useSession as jest.Mock).mockReturnValue(session);
    });
    it('should not show the user email if the user is not authenticated', () => {
      render(<Nav />);

      expect(screen.queryByText('(test@example.com)')).not.toBeInTheDocument();
      expect(screen.queryByText('Log in')).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Log in' })).toHaveAttribute(
        'href',
        '/api/auth/signin'
      );
      expect(screen.queryByAltText('Save Game')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Load Game' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'New Game' })).toBeVisible();
    });
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

  it('should start a new game when the new game button is clicked', () => {
    const session: SessionContextValue<boolean> = {
      update: jest.fn(),
      data: null,
      status: 'unauthenticated'
    };
    (useSession as jest.Mock).mockReturnValue(session);

    render(
      <GameScoreContext.Provider value={{ setGameScore, gameScore, setPlayerScore, swapBatsmen }}>
        <Nav />
      </GameScoreContext.Provider>
    );

    const newGameButton = screen.getByRole('button', { name: 'New Game' });

    act(() => {
      fireEvent.click(newGameButton);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalled();
    expect(setGameScore).toHaveBeenCalledWith([
      {
        players: defaultPlayers(),
        name: 'Team 1',
        index: 0,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: true,
        currentBowlingTeam: false,
        finishedBatting: false
      },
      {
        players: defaultPlayers(),
        name: 'Team 2',
        index: 1,
        totalRuns: 0,
        totalWicketsConceded: 0,
        totalWicketsTaken: 0,
        overs: 0,
        currentBattingTeam: false,
        currentBowlingTeam: true,
        finishedBatting: false
      }
    ]);
  });
});
