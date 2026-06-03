/**
 * Full T20 game end-to-end test.
 *
 * Simulates a complete two-innings match:
 *   - Team 1 bats 20 overs (all dot balls → 0 runs)
 *   - Team 2 bats 20 overs (all dot balls → 0 runs)
 *   - Navigates to the summary page and asserts "Match drawn"
 *
 * Key flow notes:
 *   - After every over the app shows a bowler-selection panel.
 *   - Non-disabled bowler items have a "→" arrow; disabled ones ("just bowled") do not.
 *   - Navigation to /summary uses the nav link (client-side) to preserve React context.
 */

import { expect, test, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Click the first available (non-disabled) bowler in the bowler-selection panel. */
async function selectAvailableBowler(page: Page): Promise<void> {
  await expect(page.getByText("who's bowling next?")).toBeVisible();
  // Non-disabled bowler items render a "→" arrow; disabled ones do not.
  await page.getByText('→').first().click();
}

/**
 * Play one complete innings (20 overs, all dot balls).
 *
 * After each of the first 19 overs the bowler-selection panel appears and a
 * new bowler is chosen.  The 20th over ends the innings; the caller is
 * responsible for handling whatever comes next (another innings or end-of-game).
 */
async function playInnings(page: Page): Promise<void> {
  const dotBallBtn = page.locator('button').filter({ hasText: 'dot ball' });

  for (let over = 0; over < 20; over++) {
    for (let ball = 0; ball < 6; ball++) {
      await dotBallBtn.click();
    }
    // After the last over of the innings the caller handles the transition.
    if (over < 19) {
      await selectAvailableBowler(page);
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Full T20 game', () => {
  test('plays both innings to completion and shows the match result', async ({ page }) => {
    // ── 1. Start a new match ─────────────────────────────────────────────────
    await page.goto('/');
    await page.getByRole('button', { name: 'Start New Match' }).click();
    await expect(page).toHaveURL('/match');

    // ── 2. Select the opening bowler for innings 1 ───────────────────────────
    await selectAvailableBowler(page);
    await expect(page.getByText("Scorer's pad")).toBeVisible();

    // ── 3. Innings 1 — Team 1 bats 20 overs ─────────────────────────────────
    await playInnings(page);

    // ── 4. Innings transition — select Team 2's opening bowler for innings 2 ─
    // After the 20th over the app shows the bowler panel before innings 2 starts.
    await selectAvailableBowler(page);
    await expect(page.getByText("Scorer's pad")).toBeVisible();

    // ── 5. Innings 2 — Team 2 bats 20 overs ─────────────────────────────────
    await playInnings(page);

    // ── 6. Navigate to summary (client-side link to preserve React state) ────
    await page.getByRole('link', { name: 'Summary' }).click();
    await expect(page).toHaveURL('/summary');

    // Both teams scored 0 off all dot balls → match is drawn.
    await expect(page.getByRole('heading', { name: 'Match drawn' })).toBeVisible();
  });
});
