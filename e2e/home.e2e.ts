/**
 * Home page: the primary buttons must actually do something once the page has
 * hydrated (they are client-side handlers, so a page that fails to hydrate
 * renders them but they do nothing).
 */

import { expect, test } from './fixtures';

test.describe('Home page', () => {
  test('Start New Match navigates to setup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start New Match' }).click();
    await expect(page).toHaveURL('/setup');
    await expect(page.getByRole('button', { name: 'Start Match' })).toBeVisible();
  });

  test('Start New Match clears any saved game', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('gameData', '[]'));
    await page.getByRole('button', { name: 'Start New Match' }).click();
    await expect(page).toHaveURL('/setup');
    expect(await page.evaluate(() => localStorage.getItem('gameData'))).toBeNull();
  });

  test('Resume Saved Match shows an error when there is no saved game', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Resume Saved Match' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /./ })).toHaveText('No game data found');
    await expect(page).toHaveURL('/');
  });

  test('Resume Saved Match shows an error when the saved game is corrupted', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('gameData', '{not json'));
    await page.getByRole('button', { name: 'Resume Saved Match' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /./ })).toHaveText('Saved game data is corrupted');
  });

  test('Resume Saved Match restores an in-progress game', async ({ page }) => {
    // Start a game and bowl one ball so it is persisted to localStorage.
    await page.goto('/');
    await page.getByRole('button', { name: 'Start New Match' }).click();
    await page.getByRole('button', { name: 'Start Match' }).click();
    await expect(page).toHaveURL('/match');
    await page.getByRole('button').filter({ hasText: 'Fresh' }).first().click();
    await page.locator('button').filter({ hasText: 'dot ball' }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('gameData'))).not.toBeNull();

    // Full reload drops in-memory state; resuming must bring the match back.
    await page.goto('/');
    await page.getByRole('button', { name: 'Resume Saved Match' }).click();
    await expect(page).toHaveURL('/match');
    await expect(page.getByText("Scorer's pad")).toBeVisible();
  });

  test('nav links navigate between pages', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navigation Bar' });
    for (const [name, path] of [
      ['Teams', '/teams'],
      ['Summary', '/summary'],
      ['Scoreboard', '/scoreboard'],
      ['Match', '/match'],
      ['Home', '/'],
    ] as const) {
      await nav.getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(path);
    }
  });
});
