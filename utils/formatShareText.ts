import type { Team } from '../context/GameContext';
import {
  deriveBattingStats,
  deriveBowlingStats,
  deriveTeamExtras,
  dismissalText,
  hasBatted,
  hasBowled
} from './scorecardStats';

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

function formatInningsScorecard(battingTeam: Team, bowlingTeam: Team): string[] {
  const lines: string[] = [];
  const batted = battingTeam.players.filter(hasBatted);
  const didNotBat = battingTeam.players.filter((p) => !hasBatted(p));
  const bowlers = bowlingTeam.players.filter(hasBowled);

  lines.push(`${battingTeam.name} batting`);
  for (const player of batted) {
    const stats = deriveBattingStats(player);
    lines.push(
      `${player.name.padEnd(14)} ${dismissalText(player).padEnd(12)} ${player.runs} (${stats.balls}b ${stats.fours}x4 ${stats.sixes}x6 SR ${stats.strikeRate})`
    );
  }
  lines.push(`Extras${' '.repeat(9)} ${deriveTeamExtras(battingTeam)}`);
  lines.push(
    `Total${' '.repeat(10)} ${battingTeam.totalRuns}/${battingTeam.totalWicketsConceded} (${formatOvers(battingTeam.overs)} ov)`
  );
  if (didNotBat.length > 0) {
    lines.push(`Did not bat: ${didNotBat.map((p) => p.name).join(', ')}`);
  }

  if (bowlers.length > 0) {
    lines.push('');
    lines.push(`${bowlingTeam.name} bowling`);
    for (const player of bowlers) {
      const stats = deriveBowlingStats(player);
      lines.push(
        `${player.name.padEnd(14)} ${stats.oversDisplay}-${stats.maidens}-${player.runsConceded ?? 0}-${player.wicketsTaken} (econ ${stats.economy})`
      );
    }
  }

  return lines;
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

  const [t0, t1] = teams;
  if (t0.players.some(hasBatted)) {
    lines.push('');
    lines.push(...formatInningsScorecard(t0, t1));
  }
  if (t1.players.some(hasBatted)) {
    lines.push('');
    lines.push(...formatInningsScorecard(t1, t0));
  }

  return lines.join('\n');
}
