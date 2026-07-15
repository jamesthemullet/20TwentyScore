import { fireEvent, render, screen } from '@testing-library/react';
import { GameScoreContext } from '../../context/GameScoreContext';
import type { GameScore, GameScoreContextType } from '../../context/GameContext';
import Index from '../../pages/index';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' })
}));

const mockPush = jest.fn();

jest.mock('../../components/pitch/pitch-diagram', () => ({
  __esModule: true,
  default: () => <div data-testid="pitch-diagram" />,
}));

const setGameScore = jest.fn();

const contextValue: GameScoreContextType = {
  gameScore: [] as unknown as GameScore,
  setGameScore,
  setBattingPlayerScore: jest.fn(),
  setBowlingPlayerScore: jest.fn(),
  swapBatsmen: jest.fn(),
  setCurrentBowler: jest.fn(),
  undo: jest.fn(),
  canUndo: false,
};

const renderIndex = (overrides?: Partial<GameScoreContextType>) =>
  render(
    <GameScoreContext.Provider value={{ ...contextValue, ...overrides }}>
      <Index />
    </GameScoreContext.Provider>
  );

describe('Index page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders the welcome heading and key content', () => {
    renderIndex();
    expect(screen.getByText('Welcome to 20Twenty Score')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start new match/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resume saved match/i })).toBeInTheDocument();
  });

  describe('newGame', () => {
    it('clears localStorage, calls setGameScore with two teams, and navigates to /match', () => {
      localStorage.setItem('gameData', JSON.stringify({ some: 'data' }));
      renderIndex();
      fireEvent.click(screen.getByRole('button', { name: /start new match/i }));
      expect(localStorage.getItem('gameData')).toBeNull();
      expect(setGameScore).toHaveBeenCalledTimes(1);
      const [teams] = setGameScore.mock.calls[0] as [GameScore];
      expect(teams).toHaveLength(2);
      expect(teams[0].name).toBe('Team 1');
      expect(teams[1].name).toBe('Team 2');
      expect(teams[0].currentBattingTeam).toBe(true);
      expect(teams[1].currentBowlingTeam).toBe(true);
      expect(mockPush).toHaveBeenCalledWith('/match');
    });
  });

  describe('loadGame', () => {
    it('shows error when no saved game data exists', () => {
      renderIndex();
      fireEvent.click(screen.getByRole('button', { name: /resume saved match/i }));
      expect(screen.getByRole('alert')).toHaveTextContent('No game data found');
      expect(setGameScore).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('loads saved game, calls setGameScore, and navigates to /match', () => {
      const savedGame = [{ name: 'Team A', players: [] }, { name: 'Team B', players: [] }];
      localStorage.setItem('gameData', JSON.stringify(savedGame));
      renderIndex();
      fireEvent.click(screen.getByRole('button', { name: /resume saved match/i }));
      expect(setGameScore).toHaveBeenCalledWith(savedGame);
      expect(mockPush).toHaveBeenCalledWith('/match');
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('shows error when saved game data is corrupted JSON', () => {
      localStorage.setItem('gameData', 'not-valid-json{{');
      renderIndex();
      fireEvent.click(screen.getByRole('button', { name: /resume saved match/i }));
      expect(screen.getByRole('alert')).toHaveTextContent('Saved game data is corrupted');
      expect(setGameScore).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
