import { render, screen } from '@testing-library/react';
import type { GameScore, Team, TeamPlayer } from '../../context/GameContext';
import SummaryPage from '../../pages/summary';

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/summary' })
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' })
}));

const mockUseGameScore = jest.fn();
jest.mock('../../context/GameScoreContext', () => ({
  useGameScore: () => mockUseGameScore()
}));

const basePlayer = (overrides: Partial<TeamPlayer>): TeamPlayer => ({
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
  ...overrides
});

const baseTeam = (overrides: Partial<Team>): Team => ({
  players: [],
  name: 'Team 1',
  index: 0,
  totalRuns: 0,
  totalWicketsConceded: 0,
  totalWicketsTaken: 0,
  overs: 0,
  currentBattingTeam: false,
  currentBowlingTeam: false,
  finishedBatting: false,
  ...overrides
});

describe('SummaryPage', () => {
  it('shows only the first innings scorecard when the match is in progress', () => {
    const team1 = baseTeam({
      name: 'Team 1',
      index: 0,
      totalRuns: 45,
      currentBattingTeam: true,
      players: [basePlayer({ index: 0, name: 'Opener 1', runs: 45, allActions: ['4', '4'] })]
    });
    const team2 = baseTeam({
      name: 'Team 2',
      index: 1,
      currentBowlingTeam: true,
      players: [basePlayer({ index: 0, name: 'Batter 2' })]
    });
    mockUseGameScore.mockReturnValue({ gameScore: [team1, team2] as GameScore });

    render(<SummaryPage />);

    expect(screen.getByText('1st Innings')).toBeInTheDocument();
    expect(screen.queryByText('2nd Innings')).not.toBeInTheDocument();
    expect(screen.getByText('Opener 1')).toBeInTheDocument();
  });

  it('shows both innings scorecards once the second team has started batting', () => {
    const team1 = baseTeam({
      name: 'Team 1',
      index: 0,
      totalRuns: 45,
      finishedBatting: true,
      players: [basePlayer({ index: 0, name: 'Opener 1', runs: 45, allActions: ['4', '4'] })]
    });
    const team2 = baseTeam({
      name: 'Team 2',
      index: 1,
      totalRuns: 20,
      currentBattingTeam: true,
      players: [basePlayer({ index: 0, name: 'Opener 2', runs: 20, allActions: ['4', '6'] })]
    });
    mockUseGameScore.mockReturnValue({ gameScore: [team1, team2] as GameScore });

    render(<SummaryPage />);

    expect(screen.getByText('1st Innings')).toBeInTheDocument();
    expect(screen.getByText('2nd Innings')).toBeInTheDocument();
    expect(screen.getByText('Opener 1')).toBeInTheDocument();
    expect(screen.getByText('Opener 2')).toBeInTheDocument();
  });
});
