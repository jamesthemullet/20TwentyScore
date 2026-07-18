import { fireEvent, render, screen } from '@testing-library/react';
import { GameScoreContext } from '../../context/GameScoreContext';
import type { GameScore, GameScoreContextType } from '../../context/GameContext';
import SetupPage from '../../pages/setup';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

const mockPush = jest.fn();

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

const renderSetup = () =>
  render(
    <GameScoreContext.Provider value={contextValue}>
      <SetupPage />
    </GameScoreContext.Provider>
  );

describe('Setup page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders team name and player name inputs for both teams', () => {
    renderSetup();
    expect(screen.getByRole('heading', { name: /match setup/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Team 1 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Team 2 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Team 1 player 1 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Team 1 player 11 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Team 2 player 1 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Team 2 player 11 name')).toBeInTheDocument();
  });

  it('starting a match with blank fields falls back to default names', () => {
    renderSetup();
    fireEvent.click(screen.getByRole('button', { name: /start match/i }));

    expect(setGameScore).toHaveBeenCalledTimes(1);
    const [teams] = setGameScore.mock.calls[0] as [GameScore];
    expect(teams[0].name).toBe('Team 1');
    expect(teams[1].name).toBe('Team 2');
    expect(teams[0].players[0].name).toBe('Player 1');
    expect(teams[1].players[10].name).toBe('Player 11');
    expect(mockPush).toHaveBeenCalledWith('/match');
  });

  it('starting a match with entered names uses them', () => {
    renderSetup();
    fireEvent.change(screen.getByLabelText('Team 1 name'), { target: { value: 'Runswick CC' } });
    fireEvent.change(screen.getByLabelText('Team 1 player 1 name'), {
      target: { value: 'Alice' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start match/i }));

    const [teams] = setGameScore.mock.calls[0] as [GameScore];
    expect(teams[0].name).toBe('Runswick CC');
    expect(teams[0].players[0].name).toBe('Alice');
    expect(teams[0].players[1].name).toBe('Player 2');
  });

  describe('bulk paste', () => {
    const paste = (element: HTMLElement, text: string) =>
      fireEvent.paste(element, { clipboardData: { getData: () => text } });

    it('pasting a comma-separated list into a player field distributes it across subsequent players', () => {
      renderSetup();
      paste(screen.getByLabelText('Team 1 player 1 name'), 'Alice, Bob, Carol');
      fireEvent.click(screen.getByRole('button', { name: /start match/i }));

      const [teams] = setGameScore.mock.calls[0] as [GameScore];
      expect(teams[0].players[0].name).toBe('Alice');
      expect(teams[0].players[1].name).toBe('Bob');
      expect(teams[0].players[2].name).toBe('Carol');
      expect(teams[0].players[3].name).toBe('Player 4');
    });

    it('pasting a newline-separated list starting mid-roster fills from that slot onward', () => {
      renderSetup();
      paste(screen.getByLabelText('Team 2 player 10 name'), 'Player Ten\nPlayer Eleven\nOverflow');

      expect(screen.getByLabelText('Team 2 player 10 name')).toHaveValue('Player Ten');
      expect(screen.getByLabelText('Team 2 player 11 name')).toHaveValue('Player Eleven');
    });

    it('a single-value paste is left to the default paste behaviour', () => {
      renderSetup();
      paste(screen.getByLabelText('Team 1 player 1 name'), 'Alice');

      expect(screen.getByLabelText('Team 1 player 1 name')).toHaveValue('');
    });

    it('pasting a roster into the team name field sets the team name and all player names', () => {
      renderSetup();
      paste(screen.getByLabelText('Team 1 name'), 'Runswick CC, Alice, Bob');
      fireEvent.click(screen.getByRole('button', { name: /start match/i }));

      const [teams] = setGameScore.mock.calls[0] as [GameScore];
      expect(teams[0].name).toBe('Runswick CC');
      expect(teams[0].players[0].name).toBe('Alice');
      expect(teams[0].players[1].name).toBe('Bob');
      expect(teams[0].players[2].name).toBe('Player 3');
    });
  });
});
