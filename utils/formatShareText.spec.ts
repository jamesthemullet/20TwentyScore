import { formatShareText } from './formatShareText';
import type { Team, TeamPlayer } from '../context/GameContext';

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
  ...overrides,
});

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
  ...overrides,
});

describe('formatShareText', () => {
  it('includes header and both team scores', () => {
    const t0 = baseTeam({ name: 'Team 1', totalRuns: 134, totalWicketsConceded: 6, overs: 20 });
    const t1 = baseTeam({ name: 'Team 2', index: 1, totalRuns: 98, totalWicketsConceded: 8, overs: 18.3 });
    const text = formatShareText([t0, t1]);
    expect(text).toContain('20TwentyScore · T20');
    expect(text).toContain('134/6');
    expect(text).toContain('98/8');
    expect(text).toContain('RR 6.70');
  });

  it('includes result when both teams have finished batting', () => {
    const t0 = baseTeam({ name: 'Team 1', totalRuns: 134, totalWicketsConceded: 6, overs: 20, finishedBatting: true });
    const t1 = baseTeam({ name: 'Team 2', index: 1, totalRuns: 98, totalWicketsConceded: 8, overs: 18.3, finishedBatting: true });
    const text = formatShareText([t0, t1]);
    expect(text).toContain('Result: Team 1 win by 36 runs');
  });

  it('omits result when match is in progress', () => {
    const t0 = baseTeam({ name: 'Team 1', totalRuns: 50, overs: 10 });
    const t1 = baseTeam({ name: 'Team 2', index: 1 });
    const text = formatShareText([t0, t1]);
    expect(text).not.toContain('Result:');
  });

  it('shows drawn result when scores are equal', () => {
    const t0 = baseTeam({ name: 'Team 1', totalRuns: 100, overs: 20, finishedBatting: true });
    const t1 = baseTeam({ name: 'Team 2', index: 1, totalRuns: 100, overs: 20, finishedBatting: true });
    const text = formatShareText([t0, t1]);
    expect(text).toContain('Result: Match drawn');
  });

  it('includes a full batting and bowling scorecard once a team has batted', () => {
    const t0 = baseTeam({
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
    const t1 = baseTeam({
      name: 'Team 2',
      index: 1,
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

    const text = formatShareText([t0, t1]);

    expect(text).toContain('Team 1 batting');
    expect(text).toContain('Player 1');
    expect(text).toContain('Player 2');
    expect(text).toContain('Did not bat: Player 3');
    expect(text).toContain('Total');
    expect(text).toContain('Team 2 bowling');
    expect(text).toContain('Bowler 1');
    expect(text).not.toContain('Team 2 batting');
  });
});
