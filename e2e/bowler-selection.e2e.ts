/**
 * Bowler selection on the match page: choosing a bowler must start the over
 * with that bowler, and the bowler who just finished an over must be rested.
 */

import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const bowlerButtons = (page: Page) =>
  page.getByRole('list').filter({ has: page.getByRole('button') }).getByRole('button');

const bowlerButtonNamed = (page: Page, name: string) =>
  bowlerButtons(page).filter({ has: page.locator('p', { hasText: new RegExp(`^${name}$`) }) });

const currentBowlerName = (page: Page) =>
  page.getByText('Bowling', { exact: true }).locator('xpath=following-sibling::*[1]').locator('p, span').first();

async function startMatch(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start New Match' }).click();
  await expect(page).toHaveURL('/setup');
  await page.getByRole('button', { name: 'Start Match' }).click();
  await expect(page).toHaveURL('/match');
  await expect(page.getByText("who's bowling next?")).toBeVisible();
}

async function bowlOver(page: Page): Promise<void> {
  const dotBall = page.locator('button').filter({ hasText: 'dot ball' });
  for (let ball = 0; ball < 6; ball++) {
    await dotBall.click();
  }
}

test.describe('Bowler selection', () => {
  test('selecting the opening bowler starts the innings with that bowler', async ({ page }) => {
    await startMatch(page);

    const choice = bowlerButtons(page).nth(2);
    await expect(choice).toBeEnabled();
    const name = (await choice.locator('p').first().textContent())?.trim();
    expect(name).toBeTruthy();

    await choice.click();

    await expect(page.getByText("who's bowling next?")).toBeHidden();
    await expect(page.getByText("Scorer's pad")).toBeVisible();
    await expect(currentBowlerName(page)).toHaveText(name as string);
  });

  test('after an over the previous bowler is rested and a new one can be chosen', async ({ page }) => {
    await startMatch(page);

    const first = bowlerButtons(page).nth(0);
    const firstName = (await first.locator('p').first().textContent())?.trim() as string;
    await first.click();
    await bowlOver(page);

    // End of over: the panel reappears and the bowler who just bowled is disabled.
    await expect(page.getByText("who's bowling next?")).toBeVisible();
    await expect(page.getByText(`Last over from`)).toBeVisible();
    const rested = bowlerButtonNamed(page, firstName);
    await expect(rested).toBeDisabled();
    await expect(rested).toContainText('Just bowled');

    const second = bowlerButtons(page).nth(1);
    const secondName = (await second.locator('p').first().textContent())?.trim() as string;
    expect(secondName).not.toBe(firstName);
    await second.click();

    await expect(page.getByText("Scorer's pad")).toBeVisible();
    await expect(currentBowlerName(page)).toHaveText(secondName);

    // The first bowler's figures are recorded once someone else is on.
    await bowlOver(page);
    await expect(bowlerButtonNamed(page, firstName)).toContainText('1 ov');
  });
});
