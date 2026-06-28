import type { GameScore } from '../context/GameContext';

export function generateSaveTitle(gameScore: GameScore): string {
  const [t0, t1] = gameScore;
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${t0.name} vs ${t1.name} — ${date}`;
}
