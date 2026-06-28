import { useEffect, useRef, useState } from 'react';
import type { GameScore } from '../context/GameContext';

export type MilestoneEvent = {
  message: string;
  accent: string;
};

export const MILESTONE_DURATION_MS = 2500;

export function useMilestone(
  mostRecentAction: { runs: number; action: string | null },
  gameScore: GameScore,
  currentOver: number
): MilestoneEvent | null {
  const [event, setEvent] = useState<MilestoneEvent | null>(null);
  const prevStrikerRunsRef = useRef<number>(0);
  const prevOverRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionInitRef = useRef(false);

  const currentBattingTeam = gameScore.find((t) => t.currentBattingTeam);
  const striker = currentBattingTeam?.players.find((p) => p.currentStriker);

  const triggerMilestone = (milestone: MilestoneEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setEvent(milestone);
    timerRef.current = setTimeout(() => setEvent(null), MILESTONE_DURATION_MS);
  };

  // Ball-by-ball milestone detection
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only on mostRecentAction change
  useEffect(() => {
    const currRuns = striker?.runs ?? 0;

    if (!actionInitRef.current) {
      actionInitRef.current = true;
      prevStrikerRunsRef.current = currRuns;
      return;
    }

    const { runs, action } = mostRecentAction;
    const prevRuns = prevStrikerRunsRef.current;
    const balls = striker?.allActions.filter((a) => a !== 'Wide').length ?? 0;

    if (action === 'Wicket') {
      triggerMilestone({ message: 'WICKET!', accent: '#b83320' });
    } else if (prevRuns < 100 && currRuns >= 100) {
      triggerMilestone({
        message: `CENTURY! · ${striker?.name ?? 'Batter'} · ${currRuns} off ${balls}`,
        accent: '#c9a84c',
      });
    } else if (prevRuns < 50 && currRuns >= 50) {
      triggerMilestone({
        message: `FIFTY! · ${striker?.name ?? 'Batter'} · ${currRuns} off ${balls}`,
        accent: '#c9a84c',
      });
    } else if (runs === 6) {
      triggerMilestone({
        message: `SIX! · ${striker?.name ?? 'Batter'} · ${currRuns} off ${balls}`,
        accent: '#c9a84c',
      });
    } else if (runs === 4) {
      triggerMilestone({
        message: `FOUR! · ${striker?.name ?? 'Batter'}`,
        accent: '#b83320',
      });
    }

    prevStrikerRunsRef.current = currRuns;
  }, [mostRecentAction]);

  // End of over detection
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only on currentOver change
  useEffect(() => {
    if (prevOverRef.current === null) {
      prevOverRef.current = currentOver;
      return;
    }
    if (currentOver === prevOverRef.current) return;
    const completedOver = prevOverRef.current;
    prevOverRef.current = currentOver;
    triggerMilestone({ message: `End of over ${completedOver}`, accent: '#2d7a4f' });
  }, [currentOver]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return event;
}
