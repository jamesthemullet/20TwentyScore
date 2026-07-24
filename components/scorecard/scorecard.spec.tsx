import { render, screen } from '@testing-library/react';
import type { Team, TeamPlayer } from '../../context/GameContext';
import Scorecard from './scorecard';

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

describe('Scorecard', () => {
  it('renders batting figures for players who batted', () => {
    const battingTeam = baseTeam({
      name: 'Team 1',
      totalRuns: 45,
      totalWicketsConceded: 1,
      overs: 6,
      players: [
        basePlayer({ index: 0, name: 'Player 1', runs: 32, allActions: ['1', '4', '4', '0', '6', '0'] }),
        basePlayer({
          index: 1,
          name: 'Player 2',
          runs: 13,
          status: 'Out',
          methodOfWicket: 'LBW',
          allActions: ['1', '0', 'Wicket']
        }),
        basePlayer({ index: 2, name: 'Player 3' })
      ]
    });
    const bowlingTeam = baseTeam({
      name: 'Team 2',
      players: [
        basePlayer({
          index: 0,
          name: 'Bowler 1',
          runsConceded: 20,
          wicketsTaken: 1,
          bowlingActions: ['0', '4', '0', '1', '0', 'Wicket']
        })
      ]
    });

    render(<Scorecard label="1st Innings" battingTeam={battingTeam} bowlingTeam={bowlingTeam} />);

    expect(screen.getByText('1st Innings')).toBeInTheDocument();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('LBW')).toBeInTheDocument();
    expect(screen.getByText('Did not bat: Player 3')).toBeInTheDocument();
    expect(screen.getByText('45/1 (6.0 ov)')).toBeInTheDocument();
    expect(screen.getByText('Bowler 1')).toBeInTheDocument();
  });

  it('omits the bowling table when nobody has bowled yet', () => {
    const battingTeam = baseTeam({ players: [basePlayer({ index: 0, name: 'Player 1' })] });
    const bowlingTeam = baseTeam({ players: [basePlayer({ index: 0, name: 'Bowler 1' })] });

    render(<Scorecard label="1st Innings" battingTeam={battingTeam} bowlingTeam={bowlingTeam} />);

    expect(screen.queryByText('Bowler 1')).not.toBeInTheDocument();
  });
});
