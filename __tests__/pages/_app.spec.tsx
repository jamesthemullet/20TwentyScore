import { fireEvent, render, screen } from '@testing-library/react';
import type { AppProps } from 'next/app';
import App from '../../pages/_app';
import { useGameScore, type GameScore } from '../../context/GameScoreContext';

function makeAppProps(Component: AppProps['Component']): AppProps {
  return { Component, pageProps: {} } as unknown as AppProps;
}

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="analytics" />,
}));

function StartGameButton(): React.JSX.Element {
  const { gameScore, setGameScore } = useGameScore();

  const startGame = (): void => {
    const nextScore = gameScore.map((team, index) =>
      index === 0
        ? { ...team, players: team.players.map((p, i) => (i === 0 ? { ...p, currentBowler: true } : p)) }
        : team
    ) as GameScore;
    setGameScore(nextScore);
  };

  return (
    <button type="button" onClick={startGame}>
      Start game
    </button>
  );
}

describe('App (_app.tsx)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the page component', () => {
    render(<App {...makeAppProps(() => <div>page content</div>)} />);
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('does not persist game state to localStorage before a game has started', () => {
    render(<App {...makeAppProps(StartGameButton)} />);
    expect(localStorage.setItem).not.toHaveBeenCalledWith('gameData', expect.anything());
  });

  it('persists game state to localStorage once a bowler is set', () => {
    render(<App {...makeAppProps(StartGameButton)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Start game' }));

    expect(localStorage.setItem).toHaveBeenCalledWith('gameData', expect.any(String));
    const [, storedValue] = (localStorage.setItem as jest.Mock).mock.calls.find(
      ([key]) => key === 'gameData'
    ) as [string, string];
    const stored = JSON.parse(storedValue) as GameScore;
    expect(stored[0].players[0].currentBowler).toBe(true);
  });
});
