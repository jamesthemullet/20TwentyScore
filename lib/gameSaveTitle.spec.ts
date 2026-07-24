import { generateSaveTitle } from './gameSaveTitle';
import type { GameScore } from '../context/GameContext';

describe('generateSaveTitle', () => {
  it('generates a title combining both team names with " vs " and a date', () => {
    const score = [{ name: 'Team 1' }, { name: 'Team 2' }] as unknown as GameScore;
    const title = generateSaveTitle(score);
    // Format: "Team 1 vs Team 2 — DD Mon"
    expect(title).toMatch(/^Team 1 vs Team 2 — \d{1,2} \w{3}$/);
  });

  it('reflects the exact names from both teams', () => {
    const score = [{ name: 'Team 1' }, { name: 'Team 2' }] as unknown as GameScore;
    const title = generateSaveTitle(score);
    expect(title).toContain('Team 1 vs Team 2');
  });
});
