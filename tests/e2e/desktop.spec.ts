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

  const heading = page.locator('.section-heading').first();
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('font-family', /Newsreader/);
  await expect(page.locator('body')).toHaveCSS('font-family', /Manrope/);

  const buttons = page.locator('.button:visible');
  await expect(buttons).not.toHaveCount(0);
  for (const button of await buttons.all()) {
    expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  }
});

for (const width of [1024, 1440, 1920]) {
  test(`hero keeps its single HTML headline and CTA above the fold at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const hero = page.locator('section.hero');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Cada pequena voz merece ser ouvida.');
    await expect(hero.getByText('FONOAUDIOLOGIA INFANTIL • ITAPEVA–SP', { exact: true })).toBeVisible();
    await expect(hero.getByText('Seu filho fala pouco, troca sons ou nem sempre é compreendido? A avaliação fonoaudiológica ajuda a entender suas necessidades e orientar os próximos passos.', { exact: true })).toBeVisible();
    const image = hero.locator('img');
    await expect(image).toHaveAttribute('src', '/images/hero-maisa.webp');
    await expect(image).toHaveCSS('object-fit', 'cover');
    expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0 && img.naturalWidth <= 1440)).toBe(true);
    const cta = hero.getByRole('link', { name: 'Conversar pelo WhatsApp', exact: true });
    await expect(cta).toBeInViewport({ ratio: 1 });
    await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
    const headline = await hero.locator('h1').boundingBox();
    expect(headline!.x).toBeGreaterThanOrEqual(width / 2);
    const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(sizes.content).toBe(sizes.viewport);
    if (width === 1440) expect((await hero.boundingBox())!.height).toBe(820);
  });

  test(`header navigation reaches each section at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const header = page.getByRole('banner');
    await expect(header.getByRole('navigation').getByRole('link')).toHaveCount(4);
    for (const id of ['sobre', 'avaliacao', 'areas', 'duvidas']) {
      const link = header.locator(`a[href="#${id}"]`);
      await expect(link).toBeInViewport({ ratio: 1 });
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
    }
    await expect(page.locator('section#contato')).toHaveCount(1);
    const cta = header.getByRole('link', { name: 'Agendar avaliação', exact: true });
    await expect(cta).toBeInViewport({ ratio: 1 });
    await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
    if (await cta.getAttribute('href') === '#contato') {
      await cta.click();
      await expect(page).toHaveURL(/#contato$/);
    }
    const heroCta = page.locator('.hero').getByRole('link', { name: 'Conversar pelo WhatsApp', exact: true });
    if (await heroCta.getAttribute('href') === '#contato') {
      await heroCta.click();
      await expect(page).toHaveURL(/#contato$/);
    }
  });
}

test('header stays visible without changing height when its scroll border appears', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.getByRole('banner');
  await expect(header).toHaveCSS('position', 'sticky');
  const initial = await header.boundingBox();
  await page.evaluate(() => window.scrollTo(0, 120));
  await expect(header).toHaveAttribute('data-scrolled', 'true');
  const scrolled = await header.boundingBox();
  expect(scrolled!.y).toBe(0);
  expect(scrolled!.height).toBe(initial!.height);
  await expect(header.getByRole('link', { name: 'Agendar avaliação', exact: true })).toBeInViewport({ ratio: 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveAttribute('data-scrolled', 'false');
});

test('hero message and CTA remain available when the photograph cannot load', async ({ page }) => {
  await page.route('**/images/hero-maisa.webp', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Cada pequena voz merece ser ouvida.' })).toBeVisible();
  await expect(page.locator('.hero').getByRole('link', { name: 'Conversar pelo WhatsApp', exact: true })).toBeInViewport({ ratio: 1 });
});

for (const width of [1024, 1280, 1440, 1920]) {
  test(`signals and introduction preserve readable desktop geometry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const signals = page.locator('section.signals');
    const about = page.locator('section.about#sobre');
    await expect(signals).toBeVisible();
    await expect(about).toBeVisible();
    await expect(page.locator('#sobre')).toHaveCount(1);

    const cards = signals.locator('.signal-card');
    await expect(cards).toHaveCount(6);
    const boxes = await cards.evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, bottom: box.bottom };
    }));
    for (let column = 0; column < 3; column++) {
      expect(Math.abs(boxes[column]!.y - boxes[0]!.y)).toBeLessThan(1);
      expect(Math.abs(boxes[column + 3]!.y - boxes[3]!.y)).toBeLessThan(1);
      expect(Math.abs(boxes[column]!.x - boxes[column + 3]!.x)).toBeLessThan(1);
      expect(Math.abs(boxes[column]!.width - boxes[0]!.width)).toBeLessThan(1);
      if (column > 0) expect(boxes[column]!.x).toBeGreaterThan(boxes[column - 1]!.x + boxes[column - 1]!.width);
    }
    expect(boxes[3]!.y).toBeGreaterThan(boxes[0]!.bottom);

    for (const section of [signals, about]) {
      const portrait = section.locator('.picture-frame img');
      await portrait.scrollIntoViewIfNeeded();
      await expect(portrait).toBeVisible();
      await expect(portrait).toHaveCSS('object-fit', 'cover');
      await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const bounds = (await portrait.boundingBox())!;
      expect(bounds.width / bounds.height).toBeCloseTo(4 / 5, 2);
      const cta = section.getByRole('link');
      await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
    }

    const textBlocks = page.locator('.signals h2, .signals h3, .signal-card p, .about h2');
    for (const block of await textBlocks.all()) {
      await expect(block).toBeVisible();
      const geometry = await block.evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const text = range.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return {
          textFits: text.left >= box.left - 1 && text.right <= box.right + 1 && text.bottom <= box.bottom + 2,
          widthFits: element.scrollWidth <= element.clientWidth + 1,
          heightFits: element.scrollHeight <= element.clientHeight + 1,
        };
      });
      expect(geometry).toEqual({ textFits: true, widthFits: true, heightFits: true });
    }
    const pageWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(pageWidth.content).toBe(pageWidth.viewport);
  });
}
