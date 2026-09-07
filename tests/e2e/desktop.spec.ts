import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('renders the desktop page without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main#conteudo')).toBeVisible();
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBe(sizes.viewport);
});

test('uses the Maisa type scale and accessible desktop CTA size', async ({ page }) => {
  await page.goto('/');

  const heading = page.locator('.section-heading');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('font-family', /Newsreader/);
  await expect(page.locator('body')).toHaveCSS('font-family', /Manrope/);

  const buttons = page.locator('.button:visible');
  await expect(buttons).not.toHaveCount(0);
  for (const button of await buttons.all()) {
    expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  }
});
