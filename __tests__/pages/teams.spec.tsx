import { render, screen } from '@testing-library/react';
import { GameScoreContext } from '../../context/GameScoreContext';
import type { GameScore, GameScoreContextType, TeamPlayer } from '../../context/GameContext';
import TeamsPage from '../../pages/teams';

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/teams' }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

const makePlayer = (overrides: Partial<TeamPlayer> = {}): TeamPlayer => ({
  index: 0,
  name: 'Player 1',
  runs: 0,
  wicketsTaken: 0,
  currentStriker: false,
  currentNonStriker: false,
  currentBowler: false,
  allActions: [],
  onTheCrease: false,
  status: 'Not out',
  methodOfWicket: null,
  oversBowled: 0,
  runsConceded: 0,
  ...overrides,
});

const baseGameScore: GameScore = [
  {
    index: 0,
    name: 'Runswick CC',
    players: [
      makePlayer({ index: 0, name: 'Alice', runs: 45, allActions: ['4', '4', '6'], currentStriker: true, onTheCrease: true }),
      makePlayer({ index: 1, name: 'Bob', runs: 12, allActions: ['1', '1'], currentNonStriker: true, onTheCrease: true }),
      makePlayer({ index: 2, name: 'Carol', runs: 0, allActions: [] }),
    ],
    totalRuns: 57,
    totalWicketsConceded: 1,
    totalWicketsTaken: 2,
    overs: 8.0,
    currentBattingTeam: true,
    currentBowlingTeam: false,
    finishedBatting: false,
  },
  {
    index: 1,
    name: 'Thornton XI',
    players: [
      makePlayer({ index: 0, name: 'Dave', runs: 0, allActions: [], currentBowler: true }),
      makePlayer({ index: 1, name: 'Eve', runs: 0, allActions: [], wicketsTaken: 1 }),
    ],
    totalRuns: 0,
    totalWicketsConceded: 0,
    totalWicketsTaken: 1,
    overs: 0,
    currentBattingTeam: false,
    currentBowlingTeam: true,
    finishedBatting: false,
  },
];

const contextValue: GameScoreContextType = {
  gameScore: baseGameScore,
  setGameScore: jest.fn(),
  setBattingPlayerScore: jest.fn(),
  setBowlingPlayerScore: jest.fn(),
  swapBatsmen: jest.fn(),
  setCurrentBowler: jest.fn(),
  undo: jest.fn(),
  canUndo: false,
};

const renderTeams = (overrides?: Partial<GameScoreContextType>) =>
  render(
    <GameScoreContext.Provider value={{ ...contextValue, ...overrides }}>
      <TeamsPage />
    </GameScoreContext.Provider>
  );

describe('TeamsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both team names', () => {
    renderTeams();
    expect(screen.getByText('Runswick CC')).toBeInTheDocument();
    expect(screen.getByText('Thornton XI')).toBeInTheDocument();
  });

  it('shows the formatted score for each team', () => {
    renderTeams();
    expect(screen.getByText('57/1 (8.0)')).toBeInTheDocument();
    expect(screen.getByText('0/0 (0.0)')).toBeInTheDocument();
  });

  it('renders player names and their stats', () => {
    renderTeams();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();

    const allRuns = screen.getAllByText('RUNS');
    expect(allRuns.length).toBeGreaterThan(0);
  });

  it('shows STRIKE badge on the current striker', () => {
    renderTeams();
    expect(screen.getByText('STRIKE')).toBeInTheDocument();
  });

  it('shows NON badge on the current non-striker', () => {
    renderTeams();
    expect(screen.getByText('NON')).toBeInTheDocument();
  });

  it('shows BOWLING badge on the current bowler', () => {
    renderTeams();
    expect(screen.getByText('BOWLING')).toBeInTheDocument();
  });

  it('renders team initials badges from team names', () => {
    renderTeams();
    expect(screen.getByText('RC')).toBeInTheDocument();
    expect(screen.getByText('TX')).toBeInTheDocument();
  });
});
