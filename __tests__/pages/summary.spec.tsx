import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GameScoreContext } from '../../context/GameScoreContext';
import type { GameScore, GameScoreContextType, TeamPlayer } from '../../context/GameContext';
import SummaryPage from '../../pages/summary';

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/summary' }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const { useSession } = jest.requireMock<{ useSession: jest.Mock }>('next-auth/react');

const makePlayer = (overrides: Partial<TeamPlayer> = {}): TeamPlayer => ({
  index: 0,
  name: 'Player 1',
  runs: 0,
  wicketsTaken: 0,
  currentStriker: false,
  allActions: [],
  currentNonStriker: false,
  currentBowler: false,
  onTheCrease: false,
  status: 'Not out',
  methodOfWicket: null,
  oversBowled: 0,
  runsConceded: 0,
  ...overrides,
});

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

  it('shows only the first innings scorecard when the match is in progress', () => {
    const team1 = makeTeam({
      name: 'Team 1',
      index: 0,
      totalRuns: 45,
      currentBattingTeam: true,
      currentBowlingTeam: false,
      players: [makePlayer({ index: 0, name: 'Opener 1', runs: 45, allActions: ['4', '4'] })],
    });
    const team2 = makeTeam({
      name: 'Team 2',
      index: 1,
      totalRuns: 0,
      currentBattingTeam: false,
      currentBowlingTeam: true,
      players: [makePlayer({ index: 0, name: 'Batter 2' })],
    });
    renderSummary({ gameScore: [team1, team2] as GameScore });

    expect(screen.getByText('1st Innings')).toBeInTheDocument();
    expect(screen.queryByText('2nd Innings')).not.toBeInTheDocument();
    expect(screen.getByText('Opener 1')).toBeInTheDocument();
  });

  it('shows both innings scorecards once the second team has started batting', () => {
    const team1 = makeTeam({
      name: 'Team 1',
      index: 0,
      totalRuns: 45,
      finishedBatting: true,
      currentBattingTeam: false,
      currentBowlingTeam: false,
      players: [makePlayer({ index: 0, name: 'Opener 1', runs: 45, allActions: ['4', '4'] })],
    });
    const team2 = makeTeam({
      name: 'Team 2',
      index: 1,
      totalRuns: 20,
      currentBattingTeam: true,
      currentBowlingTeam: false,
      players: [makePlayer({ index: 0, name: 'Opener 2', runs: 20, allActions: ['4', '6'] })],
    });
    renderSummary({ gameScore: [team1, team2] as GameScore });

    expect(screen.getByText('1st Innings')).toBeInTheDocument();
    expect(screen.getByText('2nd Innings')).toBeInTheDocument();
    expect(screen.getByText('Opener 1')).toBeInTheDocument();
    expect(screen.getByText('Opener 2')).toBeInTheDocument();
  });

  describe('copyScorecard', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('copies the scorecard text and shows "Copied ✓" before reverting', async () => {
      renderSummary();

      fireEvent.click(screen.getByRole('button', { name: /copy scorecard/i }));

      await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
      expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('Scorecard copied to clipboard');

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(await screen.findByRole('button', { name: /copy scorecard/i })).toBeInTheDocument();
    });
  });

  describe('saveToCloud', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      useSession.mockReturnValue({ data: { user: { name: 'Alice' } }, status: 'authenticated' });
    });

    it('creates a new cloud save via POST and stores the returned id', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 'new-save-id' }),
      });

      renderSummary();
      fireEvent.click(screen.getByRole('button', { name: /save to cloud/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/saves', expect.objectContaining({ method: 'POST' }));
      });
      expect(await screen.findByText('Saved to cloud!')).toBeInTheDocument();
      expect(localStorage.getItem('cloudSaveId')).toBe('new-save-id');
    });

    it('updates an existing cloud save via PATCH when a cloudSaveId is already stored', async () => {
      localStorage.setItem('cloudSaveId', 'existing-save-id');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'existing-save-id' }),
      });

      renderSummary();
      fireEvent.click(screen.getByRole('button', { name: /update cloud save/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/saves/existing-save-id',
          expect.objectContaining({ method: 'PATCH' })
        );
      });
      expect(await screen.findByText('Saved to cloud!')).toBeInTheDocument();
    });

    it('shows the free-limit-reached upgrade prompt on a 402 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 402 });

      renderSummary();
      fireEvent.click(screen.getByRole('button', { name: /save to cloud/i }));

      expect(await screen.findByText(/reached the free save limit/i)).toBeInTheDocument();
    });

    it('shows a generic error message on a non-OK, non-402 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

      renderSummary();
      fireEvent.click(screen.getByRole('button', { name: /save to cloud/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
    });
  });
});
