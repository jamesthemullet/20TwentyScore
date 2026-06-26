import { formatShareText } from './formatShareText';
import type { Team } from '../context/GameContext';

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
});
