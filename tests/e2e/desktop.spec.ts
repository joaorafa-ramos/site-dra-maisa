import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('area cards expose only the active face and support Enter, click and Escape', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#areas [data-flip-card]');
  await expect(cards).toHaveCount(6);
  for (const card of await cards.all()) {
    const area = (await card.getAttribute('data-area'))!;
    const button = card.getByRole('button');
    await expect(button).toHaveAccessibleName(`Saiba mais sobre ${area}`);
    const front = card.locator('.card-front');
    const back = card.locator('.card-back');
    const backCopy = (await back.locator('p').last().innerText()).trim();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(back).toHaveAttribute('aria-hidden', 'true');
    expect(await back.evaluate(element => (element as HTMLElement).inert)).toBe(true);
    expect(await card.ariaSnapshot()).not.toContain(backCopy);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveAccessibleName(`Voltar para ${area}`);
    await expect(front).toHaveAttribute('aria-hidden', 'true');
    expect(await front.evaluate(element => (element as HTMLElement).inert)).toBe(true);
    await expect(back).toHaveAttribute('aria-hidden', 'false');
    expect(await back.evaluate(element => (element as HTMLElement).inert)).toBe(false);
    expect(await card.ariaSnapshot()).toContain(backCopy);
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAccessibleName(`Saiba mais sobre ${area}`);
    await expect(button).toBeFocused();
    await expect(front).toHaveAttribute('aria-hidden', 'false');
    expect(await front.evaluate(element => (element as HTMLElement).inert)).toBe(false);
    expect(await card.ariaSnapshot()).not.toContain(backCopy);
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await card.hover();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  }
});

test('area cards switch content immediately without rotation with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.locator('#areas [data-flip-card]').first();
  const button = card.getByRole('button');
  const front = card.locator('.card-front');
  const back = card.locator('.card-back');
  await expect(front).toHaveCSS('opacity', '1');
  await expect(back).toHaveCSS('opacity', '0');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(front).toHaveCSS('opacity', '0');
  await expect(back).toHaveCSS('opacity', '1');
  for (const face of [card.locator('.area-card__faces'), front, back]) {
    await expect(face).toHaveCSS('transform', 'none');
    await expect(face).toHaveCSS('transition-duration', '0s');
  }
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(front).toHaveCSS('opacity', '1');
  await expect(back).toHaveCSS('opacity', '0');
});

test('area summaries and evaluation details are readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  const cards = page.locator('#areas [data-flip-card]');
  await expect(cards).toHaveCount(6);
  for (const card of await cards.all()) {
    await expect(card.locator('.card-front')).toBeVisible();
    await expect(card.locator('.card-back')).toBeVisible();
    const snapshot = await card.ariaSnapshot();
    expect(snapshot).toContain((await card.locator('.card-back p').last().innerText()).trim());
    await expect(card.getByRole('button')).toHaveCount(0);
  }
  await context.close();
});

for (const width of [1024, 1440, 1920]) {
  test(`area cards keep a readable three-column two-row grid at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('#areas')).toHaveCount(1);
    const cards = page.locator('#areas [data-flip-card]');
    await expect(cards).toHaveCount(6);
    const boxes = await cards.evaluateAll(elements => elements.map(element => {
      const { x, y, width, bottom } = element.getBoundingClientRect();
      return { x, y, width, bottom };
    }));
    for (let column = 0; column < 3; column++) {
      expect(boxes[column]!.y).toBe(boxes[0]!.y);
      expect(boxes[column + 3]!.y).toBe(boxes[3]!.y);
      expect(boxes[column]!.x).toBe(boxes[column + 3]!.x);
      if (column > 0) expect(boxes[column]!.x).toBeGreaterThan(boxes[column - 1]!.x + boxes[column - 1]!.width);
    }
    expect(boxes[3]!.y).toBeGreaterThan(boxes[0]!.bottom);
    for (const card of await cards.all()) {
      expect((await card.getByRole('button').boundingBox())!.height).toBeGreaterThanOrEqual(48);
      expect(await card.locator('.card-front').evaluate(element => element.scrollHeight <= element.clientHeight && element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

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

test('FAQ publishes all answers with one native accordion item open and keyboard controls', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('section#duvidas');
  const items = faq.locator('details[name="faq"]');
  const answers = [
    'Quando algo na fala, na compreensão ou na forma como a criança se comunica chama sua atenção. Você não precisa esperar ter certeza de que existe uma dificuldade para buscar orientação.',
    'A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.',
    'A avaliação acontece com escuta, brincadeiras e respeito ao ritmo da criança, para que ela se sinta segura e você saiba o que esperar.',
    'Você recebe uma explicação clara sobre o que foi observado e, quando indicado, uma proposta de acompanhamento individualizado.',
    'Cada etapa é construída de forma individualizada, considerando a idade, as necessidades e o ritmo do seu filho.',
    'Começamos ouvindo você: a rotina, o histórico do desenvolvimento e as situações que mais preocupam a família.',
  ];

  await expect(items).toHaveCount(6);
  await expect(items.locator('summary')).toHaveCount(6);
  for (const answer of answers) await expect(faq.getByText(answer, { exact: true })).toHaveCount(1);
  await expect(items.first()).toHaveAttribute('open', '');
  expect(await items.evaluateAll(elements => elements.filter(item => item.hasAttribute('open')).length)).toBe(1);

  const firstSummary = items.first().locator('summary');
  const thirdSummary = items.nth(2).locator('summary');
  await firstSummary.focus();
  await expect(firstSummary).toBeFocused();
  await expect(firstSummary).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Space');
  await expect(items.first()).not.toHaveAttribute('open', '');
  await thirdSummary.focus();
  await page.keyboard.press('Enter');
  await expect(items.nth(2)).toHaveAttribute('open', '');
  expect(await items.evaluateAll(elements => elements.filter(item => item.hasAttribute('open')).length)).toBe(1);
});

test('FAQ opening reveals existing answer characters without changing the answer text', async ({ page }) => {
  await page.goto('/');
  const item = page.locator('section#duvidas details[name="faq"]').nth(1);
  const answer = item.locator('[data-faq-answer]');
  const expectedAnswer = 'A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.';
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');
  await expect(answer).toHaveText(expectedAnswer);
  await expect(answer.locator('[data-faq-character]').first()).toHaveCSS('transition-duration', '0.3s, 0.3s');
  await expect(answer.locator('[data-faq-character]').nth(1)).toHaveCSS('transition-delay', '0.015s');
  await expect(answer.locator('[data-faq-character]').first()).toHaveCSS('filter', 'blur(0px)');
});

test('FAQ answers remain readable without JavaScript and skip reveal motion when reduced', async ({ browser }) => {
  const noJavaScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noJavaScriptPage = await noJavaScript.newPage();
  await noJavaScriptPage.goto('/');
  const noJavaScriptFaq = noJavaScriptPage.locator('section#duvidas');
  await expect(noJavaScriptFaq.locator('details[name="faq"]')).toHaveCount(6);
  await noJavaScriptFaq.locator('details[name="faq"]').nth(4).locator('summary').click();
  await expect(noJavaScriptFaq.getByText('Cada etapa é construída de forma individualizada, considerando a idade, as necessidades e o ritmo do seu filho.', { exact: true })).toBeVisible();
  await noJavaScript.close();

  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('/');
  const item = reducedPage.locator('section#duvidas details[name="faq"]').nth(1);
  const answer = item.locator('[data-faq-answer]');
  await item.locator('summary').click();
  await expect(answer).toHaveText('A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.');
  await expect(answer).toHaveCSS('filter', 'none');
  await expect(answer).toHaveCSS('transition-duration', '0s');
  await reduced.close();
});

test('final conversion section keeps its accessible empty portrait slot and 4:5 desktop geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const section = page.locator('section#conversar');
  const copy = section.locator('.final-cta__copy');
  const portrait = section.locator('.final-cta__portrait');

  await expect(section).toHaveAttribute('aria-labelledby', 'final-cta-title');
  await expect(section.locator('#final-cta-title')).toHaveCount(1);
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Você não precisa ter todas as respostas para dar o primeiro passo.');
  await expect(section.getByText('Pelo WhatsApp, você pode contar sua dúvida, conhecer o atendimento e consultar os horários disponíveis para avaliação.', { exact: true })).toBeVisible();
  await expect(section.getByRole('link', { name: 'Conversar pelo WhatsApp', exact: true })).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
  await expect(portrait.locator('img')).toHaveCount(0);
  await expect(portrait.getByRole('img', { name: 'Espaço reservado para retrato da Dra. Maisa' })).toBeVisible();

  const [copyBox, portraitBox] = await Promise.all([copy.boundingBox(), portrait.boundingBox()]);
  expect(portraitBox!.width / portraitBox!.height).toBeCloseTo(4 / 5, 2);
  expect(portraitBox!.x).toBeGreaterThan(copyBox!.x + copyBox!.width);
  expect(copyBox!.x + copyBox!.width).toBeLessThanOrEqual(portraitBox!.x);
});

test('final conversion section keeps two columns with a 300px 4:5 portrait at 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  const portrait = page.locator('section#conversar .final-cta__portrait');
  const box = (await portrait.boundingBox())!;
  expect(box.width).toBeCloseTo(300, 0);
  expect(box.width / box.height).toBeCloseTo(4 / 5, 2);
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
