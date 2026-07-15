import type { Team } from '../context/GameContext';

function calcRunRate(runs: number, overs: number): string {
  if (overs === 0) return '0.00';
  return (runs / overs).toFixed(2);
}

function formatOvers(overs: number): string {
  return overs.toFixed(1);
}

function determineResult(teams: [Team, Team]): string | null {
  const [t0, t1] = teams;
  if (!t0.finishedBatting || !t1.finishedBatting) return null;
  if (t0.totalRuns > t1.totalRuns) return `${t0.name} win by ${t0.totalRuns - t1.totalRuns} runs`;
  if (t1.totalRuns > t0.totalRuns) return `${t1.name} win by ${t1.totalRuns - t0.totalRuns} runs`;
  return 'Match drawn';
}

export function formatShareText(teams: [Team, Team]): string {
  const lines: string[] = ['20TwentyScore · T20', ''];

  for (const team of teams) {
    const score = `${team.totalRuns}/${team.totalWicketsConceded}`;
    const overs = `(${formatOvers(team.overs)} ov)`;
    const rr = `RR ${calcRunRate(team.totalRuns, team.overs)}`;
    lines.push(`${team.name.padEnd(12)} ${score.padEnd(6)} ${overs.padEnd(12)} ${rr}`);
  }

  const result = determineResult(teams);
  if (result) {
    lines.push('');
    lines.push(`Result: ${result}`);
  }

  return lines.join('\n');
}
