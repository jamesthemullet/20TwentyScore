import type { Team, TeamPlayer } from '../context/GameContext';

export type BattingStats = {
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
};

export type BowlingStats = {
  oversDisplay: string;
  maidens: number;
  economy: string;
};

export function ballsToOvers(balls: number): string {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

export function deriveBattingStats(player: TeamPlayer): BattingStats {
  const actions = player.allActions;
  const balls = actions.filter((a) => a !== null && a !== 'Wide').length;
  const fours = actions.filter((a) => a === '4').length;
  const sixes = actions.filter((a) => a === '6').length;
  const strikeRate = balls === 0 ? '0.0' : ((player.runs / balls) * 100).toFixed(1);
  return { balls, fours, sixes, strikeRate };
}

function ballRuns(entry: string | null): number {
  if (entry === 'Wide' || entry === 'No Ball') return 1;
  if (entry === 'Wicket' || entry === null) return 0;
  const n = Number.parseInt(entry, 10);
  return Number.isNaN(n) ? 0 : n;
}

function completedOvers(actions: (string | null)[]): (string | null)[][] {
  const overs: (string | null)[][] = [];
  let current: (string | null)[] = [];
  let legalBalls = 0;

  for (const entry of actions) {
    current.push(entry);
    if (entry !== 'Wide' && entry !== 'No Ball') legalBalls += 1;
    if (legalBalls === 6) {
      overs.push(current);
      current = [];
      legalBalls = 0;
    }
  }

  return overs;
}

export function deriveBowlingStats(player: TeamPlayer): BowlingStats {
  const actions = player.bowlingActions ?? [];
  const legalBalls = actions.filter((a) => a !== 'Wide' && a !== 'No Ball').length;
  const decimalOvers = legalBalls / 6;
  const runsConceded = player.runsConceded ?? 0;
  const economy = decimalOvers === 0 ? '0.00' : (runsConceded / decimalOvers).toFixed(2);
  const maidens = completedOvers(actions).filter(
    (over) => over.reduce((sum, entry) => sum + ballRuns(entry), 0) === 0
  ).length;

  return { oversDisplay: ballsToOvers(legalBalls), maidens, economy };
}

export function deriveTeamExtras(team: Team): number {
  return team.players.reduce(
    (sum, player) => sum + player.allActions.filter((a) => a === 'Wide' || a === 'No Ball').length,
    0
  );
}

export function hasBatted(player: TeamPlayer): boolean {
  return player.allActions.length > 0 || player.status === 'Out';
}

export function hasBowled(player: TeamPlayer): boolean {
  return (player.bowlingActions ?? []).length > 0;
}

export function dismissalText(player: TeamPlayer): string {
  if (player.status !== 'Out') return 'Not out';
  return player.methodOfWicket ?? 'Out';
}
