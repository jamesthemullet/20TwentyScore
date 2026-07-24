import { renderHook } from '@testing-library/react';
import { useMilestone } from './useMilestone';
import type { GameScore } from '../context/GameContext';

const makeGameScore = (strikerRuns: number, allActions: (string | null)[] = []): GameScore =>
  [
    {
      players: [
        {
          index: 0,
          name: 'Test Player',
          runs: strikerRuns,
          wicketsTaken: 0,
          currentStriker: true,
          currentNonStriker: false,
          currentBowler: false,
          onTheCrease: true,
          status: 'Not out',
          methodOfWicket: null,
          allActions,
          oversBowled: 0,
          runsConceded: 0,
        },
      ],
      name: 'Team 1',
      index: 0,
      totalRuns: strikerRuns,
      totalWicketsConceded: 0,
      totalWicketsTaken: 0,
      overs: 0,
      currentBattingTeam: true,
      currentBowlingTeam: false,
      finishedBatting: false,
    },
    {
      players: [],
      name: 'Team 2',
      index: 1,
      totalRuns: 0,
      totalWicketsConceded: 0,
      totalWicketsTaken: 0,
      overs: 0,
      currentBattingTeam: false,
      currentBowlingTeam: true,
      finishedBatting: false,
    },
  ] as GameScore;

type HookProps = {
  action: { runs: number; action: string | null };
  score: GameScore;
  over: number;
};

describe('useMilestone', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null on the initial render', () => {
    const { result } = renderHook(() =>
      useMilestone({ runs: 0, action: null }, makeGameScore(0), 1)
    );
    expect(result.current).toBeNull();
  });

  it('fires a WICKET milestone when mostRecentAction has action "Wicket"', () => {
    const initial: HookProps = { action: { runs: 0, action: null }, score: makeGameScore(0), over: 1 };
    const { result, rerender } = renderHook(
      ({ action, score, over }: HookProps) => useMilestone(action, score, over),
      { initialProps: initial }
    );
    expect(result.current).toBeNull();

    rerender({ action: { runs: 0, action: 'Wicket' }, score: makeGameScore(0), over: 1 });
    expect(result.current?.message).toBe('WICKET!');
    expect(result.current?.accent).toBe('#b83320');
  });

  it('fires a FIFTY milestone when striker crosses 50 runs', () => {
    const { result, rerender } = renderHook(
      ({ action, score, over }: HookProps) => useMilestone(action, score, over),
      // Initial: striker has 47 runs; init effect stores prevStrikerRuns = 47
      { initialProps: { action: { runs: 1, action: null }, score: makeGameScore(47), over: 1 } }
    );
    expect(result.current).toBeNull();

    // Rerender: striker now has 53 runs — crossed 50
    rerender({ action: { runs: 6, action: null }, score: makeGameScore(53), over: 1 });
    expect(result.current?.message).toContain('FIFTY!');
    expect(result.current?.message).toContain('Test Player');
  });

  it('fires an end-of-over milestone when currentOver increments', () => {
    // Use a stable object reference for mostRecentAction so the ball-by-ball effect
    // does not re-trigger — only the currentOver effect fires.
    const stableAction = { runs: 0, action: null };
    const { result, rerender } = renderHook(
      ({ action, score, over }: HookProps) => useMilestone(action, score, over),
      { initialProps: { action: stableAction, score: makeGameScore(0), over: 1 } }
    );
    expect(result.current).toBeNull();

    rerender({ action: stableAction, score: makeGameScore(0), over: 2 });
    expect(result.current?.message).toBe('End of over 1');
    expect(result.current?.accent).toBe('#2d7a4f');
  });
});
