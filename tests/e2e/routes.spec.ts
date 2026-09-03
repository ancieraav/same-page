import { expect, test } from '@playwright/test';

const routes = ['/', '/join', '/create', '/waiting', '/session', '/comparison', '/meme', '/analytics', '/participants', '/profile'];

test('all clean Next routes render', async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
  }
});

test('join code flow uses the Next route', async ({ page }) => {
  await page.goto('/');
  const code = 'ABC1234';
  for (let index = 0; index < code.length; index += 1) {
    await page.locator(`#code-box-${String(index + 1)}`).fill(code.charAt(index));
  }
  await page.getByRole('button', { name: 'Join Room' }).click();
  await expect(page).toHaveURL(/\/join\?code=ABC1234/);
});

test('create room stores the demo room and opens waiting room', async ({ page }) => {
  await page.goto('/create');
  await page.locator('#room-name').fill('Release Planning');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL(/\/waiting/);
  await expect(page.getByRole('heading', { name: 'Release Planning' })).toBeVisible();
});

test('session editor submits an answer to comparison', async ({ page }) => {
  await page.goto('/session');
  await page.waitForTimeout(1900);
  await page.locator('#participant-answer-input').fill('Ship the reliable checkout loop first.');
  await page.getByRole('button', { name: 'Submit Response' }).click();
  await expect(page).toHaveURL(/\/comparison\?q=1&review=1/);
});

test('participant cards open an accessible modal', async ({ page }) => {
  await page.goto('/participants');
  await page.getByRole('button', { name: /View Alex Morgan analytics/ }).click();
  await expect(page.locator('.analytics-modal-backdrop.is-active')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.analytics-modal-backdrop.is-active')).toHaveCount(0);
});
