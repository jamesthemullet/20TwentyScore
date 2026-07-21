import { render, screen } from '@testing-library/react';
import { GameScoreContext } from '../../context/GameScoreContext';
import type { GameScore, GameScoreContextType } from '../../context/GameContext';
import SummaryPage from '../../pages/summary';

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/summary' }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const { useSession } = jest.requireMock<{ useSession: jest.Mock }>('next-auth/react');

const makeTeam = (overrides: Partial<GameScore[0]> = {}): GameScore[0] => ({
  index: 0,
  name: 'Runswick CC',
  players: [],
  totalRuns: 80,
  totalWicketsConceded: 3,
  totalWicketsTaken: 0,
  overs: 10,
  currentBattingTeam: true,
  currentBowlingTeam: false,
  finishedBatting: false,
  ...overrides,
});

const baseContext: GameScoreContextType = {
  gameScore: [
    makeTeam({ index: 0, name: 'Runswick CC', totalRuns: 80, currentBattingTeam: true, currentBowlingTeam: false }),
    makeTeam({ index: 1, name: 'Thornton XI', totalRuns: 60, currentBattingTeam: false, currentBowlingTeam: true }),
  ] as GameScore,
  setGameScore: jest.fn(),
  setBattingPlayerScore: jest.fn(),
  setBowlingPlayerScore: jest.fn(),
  swapBatsmen: jest.fn(),
  setCurrentBowler: jest.fn(),
  undo: jest.fn(),
  canUndo: false,
};

const renderSummary = (contextOverrides?: Partial<GameScoreContextType>) =>
  render(
    <GameScoreContext.Provider value={{ ...baseContext, ...contextOverrides }}>
      <SummaryPage />
    </GameScoreContext.Provider>
  );

describe('SummaryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('shows "Match in progress" when neither team has finished batting', () => {
    renderSummary();
    expect(screen.getByText('Match in progress')).toBeInTheDocument();
    expect(screen.getByText(/Head to/)).toBeInTheDocument();
  });

  it('shows the winning team name when both teams have finished batting', () => {
    const gameScore: GameScore = [
      makeTeam({ index: 0, name: 'Runswick CC', totalRuns: 120, finishedBatting: true, currentBattingTeam: false }),
      makeTeam({ index: 1, name: 'Thornton XI', totalRuns: 90, finishedBatting: true, currentBattingTeam: true }),
    ];
    renderSummary({ gameScore });
    expect(screen.getByText('Runswick CC win')).toBeInTheDocument();
  });

  it('shows "Match drawn" when both teams have finished batting with equal runs', () => {
    const gameScore: GameScore = [
      makeTeam({ index: 0, name: 'Runswick CC', totalRuns: 100, finishedBatting: true, currentBattingTeam: false }),
      makeTeam({ index: 1, name: 'Thornton XI', totalRuns: 100, finishedBatting: true, currentBattingTeam: true }),
    ];
    renderSummary({ gameScore });
    expect(screen.getByText('Match drawn')).toBeInTheDocument();
  });

  it('renders the "Copy scorecard" button', () => {
    renderSummary();
    expect(screen.getByRole('button', { name: /copy scorecard/i })).toBeInTheDocument();
  });

  it('does not show the cloud save section when user is not logged in', () => {
    renderSummary();
    expect(screen.queryByRole('button', { name: /save to cloud/i })).not.toBeInTheDocument();
  });

  it('shows "Save to cloud" button when user is logged in', () => {
    useSession.mockReturnValue({ data: { user: { name: 'Alice' } }, status: 'authenticated' });
    renderSummary();
    expect(screen.getByRole('button', { name: /save to cloud/i })).toBeInTheDocument();
  });

  it('shows "Update cloud save" button when user is logged in and a cloud save already exists', () => {
    useSession.mockReturnValue({ data: { user: { name: 'Alice' } }, status: 'authenticated' });
    localStorage.setItem('cloudSaveId', 'existing-save-id');
    renderSummary();
    expect(screen.getByRole('button', { name: /update cloud save/i })).toBeInTheDocument();
  });

  it('shows the match heading', () => {
    renderSummary();
    expect(screen.getByRole('heading', { name: /match summary/i })).toBeInTheDocument();
  });
});
