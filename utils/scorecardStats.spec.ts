import type { Team, TeamPlayer } from '../context/GameContext';
import {
  ballsToOvers,
  deriveBattingStats,
  deriveBowlingStats,
  deriveTeamExtras,
  dismissalText,
  hasBatted,
  hasBowled
} from './scorecardStats';

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

describe('ballsToOvers', () => {
  it('formats whole overs', () => {
    expect(ballsToOvers(24)).toBe('4.0');
  });

  it('formats partial overs', () => {
    expect(ballsToOvers(20)).toBe('3.2');
  });
});

describe('deriveBattingStats', () => {
  it('counts balls faced, excluding wides', () => {
    const player = basePlayer({
      runs: 11,
      allActions: ['1', '4', 'Wide', '0', '6']
    });
    const stats = deriveBattingStats(player);
    expect(stats.balls).toBe(4);
    expect(stats.fours).toBe(1);
    expect(stats.sixes).toBe(1);
    expect(stats.strikeRate).toBe('275.0');
  });

  it('returns 0.0 strike rate when no balls faced', () => {
    const player = basePlayer({ allActions: [] });
    expect(deriveBattingStats(player).strikeRate).toBe('0.0');
  });
});

describe('deriveBowlingStats', () => {
  it('computes overs and economy from legal deliveries', () => {
    const player = basePlayer({
      runsConceded: 24,
      bowlingActions: ['0', '4', 'Wide', '1', '0', 'Wicket', '0', '2']
    });
    const stats = deriveBowlingStats(player);
    expect(stats.oversDisplay).toBe('1.1');
    expect(stats.economy).toBe('20.57');
  });

  it('counts a completed over of all dot balls as a maiden', () => {
    const player = basePlayer({
      runsConceded: 0,
      bowlingActions: ['0', '0', '0', 'Wicket', '0', '0']
    });
    expect(deriveBowlingStats(player).maidens).toBe(1);
  });

  it('does not count an over with a boundary as a maiden', () => {
    const player = basePlayer({
      runsConceded: 4,
      bowlingActions: ['0', '0', '4', '0', '0', '0']
    });
    expect(deriveBowlingStats(player).maidens).toBe(0);
  });

  it('does not count an incomplete over as a maiden', () => {
    const player = basePlayer({
      runsConceded: 0,
      bowlingActions: ['0', '0', '0']
    });
    expect(deriveBowlingStats(player).maidens).toBe(0);
  });

  it('returns 0.00 economy when no legal balls bowled', () => {
    const player = basePlayer({ bowlingActions: [] });
    expect(deriveBowlingStats(player).economy).toBe('0.00');
  });
});

describe('deriveTeamExtras', () => {
  it('sums wides and no balls across all players', () => {
    const team = baseTeam({
      players: [
        basePlayer({ index: 0, allActions: ['1', 'Wide'] }),
        basePlayer({ index: 1, allActions: ['No Ball', '4', 'Wide'] })
      ]
    });
    expect(deriveTeamExtras(team)).toBe(3);
  });
});

describe('hasBatted / hasBowled', () => {
  it('treats a player with recorded actions as having batted', () => {
    expect(hasBatted(basePlayer({ allActions: ['1'] }))).toBe(true);
  });

  it('treats an out player with no actions recorded as having batted', () => {
    expect(hasBatted(basePlayer({ allActions: [], status: 'Out' }))).toBe(true);
  });

  it('treats a player with no actions and not out as not having batted', () => {
    expect(hasBatted(basePlayer({ allActions: [], status: 'Not out' }))).toBe(false);
  });

  it('treats a player with recorded bowling actions as having bowled', () => {
    expect(hasBowled(basePlayer({ bowlingActions: ['0'] }))).toBe(true);
  });

  it('treats a player with no bowling actions as not having bowled, even if they batted', () => {
    expect(hasBowled(basePlayer({ allActions: ['1', '4'], bowlingActions: [] }))).toBe(false);
  });
});

describe('dismissalText', () => {
  it('returns Not out for players who have not been dismissed', () => {
    expect(dismissalText(basePlayer({ status: 'Not out' }))).toBe('Not out');
  });

  it('returns the method of wicket when out', () => {
    expect(dismissalText(basePlayer({ status: 'Out', methodOfWicket: 'LBW' }))).toBe('LBW');
  });

  it('falls back to Out when method of wicket is missing', () => {
    expect(dismissalText(basePlayer({ status: 'Out', methodOfWicket: null }))).toBe('Out');
  });
});
