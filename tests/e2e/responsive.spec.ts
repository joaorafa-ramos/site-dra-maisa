import { expect, test, type Locator, type Page } from '@playwright/test';

const center = async (locator: Locator) => {
  const box = (await locator.boundingBox())!;
  return box.x + box.width / 2;
};

const expectNoHorizontalOverflow = async (page: Page) => {
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(sizes.content).toBe(sizes.viewport);
};

// Catches the old `body { min-width: 1024px }` or any section that forces sideways scrolling on phones and tablets.
for (const width of [375, 390, 768]) {
  test(`page fits a ${width}px viewport with stacked sections and one H1`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main section h2')).not.toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    const hero = page.locator('.hero');
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Conversar sobre meu filho', exact: true })).toBeVisible();

    const intro = (await page.locator('.signals__intro').boundingBox())!;
    const portrait = (await page.locator('.signals__portrait').boundingBox())!;
    const list = (await page.locator('.signals__list').boundingBox())!;
    expect(portrait.y).toBeGreaterThan(intro.y + intro.height);
    expect(list.y).toBeGreaterThan(portrait.y + portrait.height);

    const areaColumns = await page.locator('#areas [data-area-card]').evaluateAll(cards => new Set(cards.map(card => Math.round(card.getBoundingClientRect().x))).size);
    expect(areaColumns).toBe(width >= 600 ? 2 : 1);
    const stepColumns = await page.locator('#avaliacao ol > li').evaluateAll(steps => new Set(steps.map(step => Math.round(step.getBoundingClientRect().x))).size);
    expect(stepColumns).toBe(width >= 768 ? 3 : 1);

    for (const cta of await page.locator('main .button').all()) {
      const box = (await cta.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
  });
}

// Catches a mobile menu that cannot be opened, loses keyboard focus or leaves navigation unreachable.
test('mobile menu toggles with click and keyboard, closes on Escape and after navigating', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.getByRole('banner');
  const toggle = header.getByRole('button', { name: 'Menu' });
  const panel = header.locator('#site-menu');

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-controls', 'site-menu');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.getByRole('link')).toHaveCount(5);
  for (const link of await panel.getByRole('link').all()) {
    await expect(link).toBeInViewport({ ratio: 1 });
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  }
  await expect(panel.getByRole('link', { name: 'Sobre', exact: true })).toHaveCSS('color', 'rgb(48, 86, 106)');

  await page.keyboard.press('Tab');
  await expect(panel.getByRole('link', { name: 'Sobre', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(panel).toBeHidden();

  await toggle.click();
  await panel.getByRole('link', { name: 'Dúvidas', exact: true }).click();
  await expect(page).toHaveURL(/#duvidas$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeInViewport();
});

// Catches an open panel left covering content after focus or a tap moves elsewhere (Farol F-01).
test('mobile menu closes when focus or a tap leaves it and on Escape from anywhere', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.getByRole('banner');
  const toggle = header.getByRole('button', { name: 'Menu' });
  const panel = header.locator('#site-menu');

  // Tabbing past the last panel link moves focus out of the header.
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await panel.getByRole('link', { name: 'WhatsApp', exact: true }).focus();
  await page.keyboard.press('Tab');
  expect(await header.evaluate(element => element.contains(document.activeElement))).toBe(false);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  // A tap outside the header closes without stealing focus.
  await toggle.click();
  await expect(panel).toBeVisible();
  await page.locator('.hero__description').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  // A tap inside the panel keeps it open.
  await toggle.click();
  await panel.click({ position: { x: 8, y: 8 } });
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  // Escape works with focus outside the header and returns focus to the toggle.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(panel).toBeHidden();
});

// Catches FAQ questions running into the +/− indicator on narrow screens (Farol F-02).
for (const width of [375, 390]) {
  test(`FAQ questions keep clear space before the indicator at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const gaps = await page.locator('#duvidas .faq__item summary').evaluateAll(summaries => summaries.map(summary => {
      const range = document.createRange();
      range.selectNodeContents(summary.querySelector(':scope > span:first-child')!);
      const text = range.getBoundingClientRect();
      const indicator = summary.querySelector('.faq__indicator')!.getBoundingClientRect();
      return indicator.left - text.right;
    }));
    expect(gaps).toHaveLength(8);
    for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(12);
  });
}

test('desktop keeps the inline navigation without a menu button', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');
  const header = page.getByRole('banner');
  await expect(header.getByRole('button', { name: 'Menu' })).toBeHidden();
  for (const link of await header.getByRole('navigation').getByRole('link').all()) await expect(link).toBeInViewport({ ratio: 1 });
  await expectNoHorizontalOverflow(page);
});

// Catches a tall sticky header covering content, or cream links on light sections, without JavaScript (Farol F-03).
test('navigation stays reachable and legible on a phone without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 800 } });
  const page = await context.newPage();
  await page.goto('/');
  const header = page.getByRole('banner');
  await expect(header.getByRole('button', { name: 'Menu' })).toBeHidden();
  for (const link of await header.getByRole('link').all()) await expect(link).toBeVisible();
  for (const link of await header.locator('.site-header__nav a').all()) await expect(link).toHaveCSS('color', 'rgb(48, 86, 106)');
  await expect(header).not.toHaveCSS('position', 'sticky');
  await expectNoHorizontalOverflow(page);

  // Scroll the heading itself, not the whole (now 8-item) section: scrolling the section can align its
  // far edge into view on a short viewport, pushing the heading at its top back out.
  await page.locator('#duvidas h2').scrollIntoViewIfNeeded();
  await expect(header).not.toBeInViewport();
  await expect(page.locator('#duvidas h2')).toBeInViewport();
  await context.close();
});

test('desktop header keeps navy links on a light background without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  const header = page.getByRole('banner');
  await expect(header).toHaveCSS('background-color', 'rgba(247, 242, 238, 0.94)');
  for (const link of await header.locator('.site-header__nav a').all()) await expect(link).toHaveCSS('color', 'rgb(48, 86, 106)');
  await context.close();
});

// Catches cream navigation text left over light sections once the header leaves the hero photo.
test('header navigation switches to navy on a light header after the hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.getByRole('banner');
  await page.locator('#duvidas').scrollIntoViewIfNeeded();
  await page.mouse.move(720, 6);
  await expect(header).toHaveAttribute('data-over-hero', 'false');
  await expect(header).toHaveCSS('background-color', 'rgba(247, 242, 238, 0.94)');
  for (const link of await header.locator('.site-header__nav a').all()) await expect(link).toHaveCSS('color', 'rgb(48, 86, 106)');
});

// Catches the approved section treatments: centered intros on one axis and distinct Evaluation/Areas/FAQ grounds.
for (const width of [390, 1440]) {
  test(`section intros share one axis and sections keep distinct backgrounds at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('#avaliacao')).toHaveCSS('background-color', 'rgb(227, 240, 242)');
    await expect(page.locator('#areas')).toHaveCSS('background-color', 'rgb(241, 229, 221)');
    await expect(page.locator('#duvidas')).toHaveCSS('background-color', 'rgb(247, 242, 238)');

    for (const selector of ['.signals__intro', '#areas .areas__intro', '#duvidas .faq__intro']) {
      const intro = page.locator(selector);
      const axis = await center(intro);
      for (const part of await intro.locator('.section-eyebrow, h2, .section-description').all()) {
        expect(Math.abs((await center(part)) - axis), selector).toBeLessThanOrEqual(1);
      }
      await expect(intro.locator('h2')).toHaveCSS('text-align', 'center');
    }
  });
}

// Catches the approved copy regressing or the replaced wording coming back.
test('renders the approved About, Evaluation and Areas copy', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('main');
  for (const text of [
    'Por isso, cada acompanhamento começa com uma avaliação fonoaudiológica: uma escuta atenta à família e um olhar individual para a criança. Com atividades lúdicas, vínculo e objetivos terapêuticos claros, construímos um caminho para que ela possa se comunicar com mais segurança.',
    'A avaliação fonoaudiológica acontece com escuta, atividades lúdicas e respeito ao ritmo da criança — para que ela se sinta segura e você saiba o que esperar.',
    'Não há respostas certas ou erradas. A avaliação é conduzida com atenção, acolhimento e respeito ao modo de cada criança se comunicar.',
    'Crianças que falam pouco, têm dificuldade para formar frases ou compreender e usar a linguagem.',
    'Estimulação da fala e da linguagem para crianças que utilizam AASI (aparelho de amplificação sonora individual), implante coclear ou ambos.',
  ]) {
    await expect(main.getByText(text, { exact: true })).toHaveCount(1);
  }
  await expect(page.locator('#areas [data-area="Comunicação na deficiência auditiva"]')).toHaveCount(1);
  await expect(main).not.toContainText('brincadeiras');
  await expect(main).not.toContainText('acertar');
});

// Catches signals hidden behind interaction again: every title and description is listed and readable on a phone,
// with reduced motion and without JavaScript.
for (const mode of ['reduced motion', 'no JavaScript'] as const) {
  test(`signals stay an always-open semantic list at 390px with ${mode}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 800 },
      ...(mode === 'reduced motion' ? { reducedMotion: 'reduce' as const } : { javaScriptEnabled: false }),
    });
    const page = await context.newPage();
    await page.goto('/');
    const list = page.locator('section.signals').getByRole('list');
    const items = list.getByRole('listitem');
    await expect(items).toHaveCount(6);
    await expect(list.locator('details, summary')).toHaveCount(0);
    for (const item of await items.all()) {
      await expect(item.getByRole('heading', { level: 3 })).toBeVisible();
      await expect(item.locator('p')).toBeVisible();
    }
    // On narrow screens the portrait returns to its natural 4:5 ratio above the cards.
    const portrait = (await page.locator('.signals__portrait').boundingBox())!;
    expect(portrait.width / portrait.height).toBeCloseTo(0.8, 2);
    expect((await list.boundingBox())!.y).toBeGreaterThan(portrait.y + portrait.height);
    await context.close();
  });
}

test('contact eyebrow is readable on the navy panel', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contato .section-eyebrow')).toHaveCSS('color', 'rgba(247, 242, 238, 0.84)');
});

// Shared by both loops below: composites every painted ancestor background from the page root down to
// the element, then returns its contrast ratio against that ground.
const readContrastRatio = (locator: ReturnType<import('@playwright/test').Page['locator']>) =>
  locator.evaluate(element => {
    const parse = (value: string) => {
      const [r = 0, g = 0, b = 0, a = 1] = value.match(/[\d.]+/g)!.map(Number);
      return { r, g, b, a };
    };
    const over = (top: { r: number; g: number; b: number; a: number }, bottom: { r: number; g: number; b: number }) => ({
      r: top.r * top.a + bottom.r * (1 - top.a),
      g: top.g * top.a + bottom.g * (1 - top.a),
      b: top.b * top.a + bottom.b * (1 - top.a),
      a: 1,
    });
    const layers: HTMLElement[] = [];
    for (let node: HTMLElement | null = element.parentElement; node; node = node.parentElement) layers.unshift(node);
    let ground = { r: 255, g: 255, b: 255, a: 1 };
    for (const layer of layers) {
      const color = parse(getComputedStyle(layer).backgroundColor);
      if (color.a > 0) ground = over(color, ground);
    }
    const ink = over(parse(getComputedStyle(element).color), ground);
    const luminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const channel = (value: number) => {
        const v = value / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const [light, dark] = [luminance(ink), luminance(ground)].sort((x, y) => y - x);
    return (light! + 0.05) / (dark! + 0.05);
  });

// Iris 11.b A-02: the chip is kept only where it earns its place — Hero, Sinais and Contato. The other
// 5 sections' H2 already carries the section, so their eyebrow is plain caps text, no border/pill.
const navy = 'rgb(48, 86, 106)';
const eyebrowChips = [
  { section: 'section.hero', selector: '.hero__eyebrow', ink: 'rgb(247, 242, 238)', align: 'left' },
  { section: 'section.signals', selector: '.section-eyebrow', ink: navy, align: 'center' },
  { section: '#contato', selector: '.section-eyebrow', ink: 'rgba(247, 242, 238, 0.84)', align: 'center' },
] as const;

const plainEyebrows = [
  // "start" is the browser's computed value for unset text-align (left, in this LTR page), not "left" itself.
  { section: '#sobre', align: 'start' },
  { section: '#avaliacao', align: 'start' },
  { section: '#areas', align: 'center' },
  { section: '#duvidas', align: 'center' },
  { section: '#localizacoes', align: 'center' },
] as const;

for (const width of [390, 1440]) {
  test(`hero, sinais and contato eyebrows are outlined chips in their section ink at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.site-footer .section-eyebrow, .site-footer .hero__eyebrow')).toHaveCount(0);

    for (const chip of eyebrowChips) {
      const eyebrow = page.locator(chip.section).locator(chip.selector);
      await expect(eyebrow, chip.section).toHaveCount(1);
      await expect(eyebrow).toBeVisible();
      await expect(eyebrow).toHaveCSS('display', 'inline-flex');
      await expect(eyebrow).toHaveCSS('border-top-style', 'solid');
      await expect(eyebrow).toHaveCSS('border-top-width', '1px');
      await expect(eyebrow).toHaveCSS('border-top-left-radius', '999px');
      await expect(eyebrow).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(eyebrow).toHaveCSS('line-height', '12px');
      await expect(eyebrow).toHaveCSS('margin-bottom', '24px');
      await expect(eyebrow).toHaveCSS('color', chip.ink);
      await expect(eyebrow).toHaveCSS('border-top-color', chip.ink);
      await expect(eyebrow).toHaveCSS('border-bottom-color', chip.ink);

      // The chip shrinks to its text and follows the intro's alignment.
      const geometry = await eyebrow.evaluate(element => {
        const box = element.getBoundingClientRect();
        const parent = element.parentElement!.getBoundingClientRect();
        return { left: box.left - parent.left, right: parent.right - box.right, width: box.width, parentWidth: parent.width };
      });
      expect(geometry.width).toBeLessThan(geometry.parentWidth);
      if (chip.align === 'center') expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(1);
      else expect(geometry.left).toBeLessThanOrEqual(1);

      const ratio = await readContrastRatio(eyebrow);
      expect(ratio, `${chip.section} eyebrow contrast`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test(`sobre, avaliacao, areas, duvidas and localizacoes eyebrows are plain caps text, no pill, at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    for (const plain of plainEyebrows) {
      const eyebrow = page.locator(plain.section).locator('.section-eyebrow');
      await expect(eyebrow, plain.section).toHaveCount(1);
      await expect(eyebrow).toBeVisible();
      await expect(eyebrow).toHaveCSS('display', 'block');
      await expect(eyebrow).toHaveCSS('border-top-style', 'none');
      await expect(eyebrow).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(eyebrow).toHaveCSS('color', navy);
      await expect(eyebrow).toHaveCSS('margin-bottom', '24px');
      expect(await eyebrow.innerText()).toBe((await eyebrow.innerText()).toUpperCase());
      // A block-level eyebrow spans its parent's width, so alignment lives in text-align, not box position.
      await expect(eyebrow).toHaveCSS('text-align', plain.align);

      const ratio = await readContrastRatio(eyebrow);
      expect(ratio, `${plain.section} eyebrow contrast`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
