import { expect, test, type Locator } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

// Waits until the element has no running animation. A transition replaced mid-flight (for example when a reveal
// class lands during a hover) rejects its `finished` promise, so keep waiting on whatever is still running instead.
const settled = (locator: Locator) =>
  locator.evaluate(async element => {
    const running = () => element.getAnimations().filter(animation => animation.playState !== 'finished');
    for (let animations = running(); animations.length > 0; animations = running()) {
      await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)));
    }
  });

// Document-relative box, so clicks that scroll the page do not change the comparison.
const pageBox = (locator: Locator) =>
  locator.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height };
  });

const toMilliseconds = (value: string) => Math.round(parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000));

test('publishes complete, truthful SEO metadata and accessible optimized images', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Fonoaudióloga infantil em Itapeva | Maisa Palma');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Seu filho fala pouco ou é difícil compreendê-lo? Conheça o atendimento infantil da fonoaudióloga Maisa Palma, em Itapeva. Converse pelo WhatsApp.',
  );
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F7F2EE');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Fonoaudióloga infantil em Itapeva | Maisa Palma');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');

  const jsonLd = await page.locator('head script[type="application/ld+json"]').textContent();
  const schema = JSON.parse(jsonLd!);
  expect(schema['@context']).toBe('https://schema.org');
  expect(schema['@graph'].map((item: { '@type': string }) => item['@type'])).toEqual(['Person', 'MedicalBusiness']);
  expect(JSON.stringify(schema)).toContain('https://instagram.com/fonomaisapalma');
  const [person, medicalBusiness] = schema['@graph'];
  expect(person.hasCredential.name).toBe('CRFa 2-23944');
  expect(medicalBusiness.telephone).toBe('+55-15-99271-9708');
  expect(medicalBusiness.address.streetAddress).toBe('Alameda Toledo Ribas, 628');
  expect(medicalBusiness.location).toHaveLength(2);
  // No confirmed PUBLIC_SITE_URL yet: ids stay relative, no absolute urls or og:image are fabricated.
  expect(person['@id']).toBe('#maisa');
  expect(medicalBusiness.url).toBeUndefined();

  const images = page.locator('img');
  await expect(images).not.toHaveCount(0);
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute('alt', /.+/);
    await expect(image).toHaveAttribute('width', /\d+/);
    await expect(image).toHaveAttribute('height', /\d+/);
    const dimensions = await image.evaluate((element: HTMLImageElement) => {
      const box = element.getBoundingClientRect();
      return { deliveredWidth: element.naturalWidth, displayWidth: box.width, isHero: Boolean(element.closest('.hero')) };
    });
    if (!dimensions.isHero) {
      expect(dimensions.deliveredWidth).toBeLessThanOrEqual(Math.ceil(dimensions.displayWidth * 2));
    }
  }
  await expect(page.locator('.hero img')).toHaveAttribute('loading', 'eager');
  await expect(page.locator('.hero img')).toHaveAttribute('fetchpriority', 'high');
  for (const image of await page.locator('main img').all()) {
    if (await image.evaluate(element => !element.closest('.hero'))) {
      await expect(image).toHaveAttribute('loading', 'lazy');
    }
  }
});

test('WhatsApp CTAs push a whatsapp_click event to dataLayer with their origin and label', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('.hero').getByRole('link', { name: 'Conversar sobre meu filho', exact: true });
  await expect(cta).toHaveAttribute('data-whatsapp-cta', '');
  // Dispatch a real (bubbling) click so the delegated document listener in site-interactions.ts fires,
  // but cancel it first so the anchor's real href/target never navigates the test page away.
  const pushed = await cta.evaluate(link => {
    const anchor = link as HTMLAnchorElement;
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    anchor.addEventListener('click', event => event.preventDefault(), { once: true });
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return (window as unknown as { dataLayer: unknown[] }).dataLayer;
  });
  expect(pushed).toEqual([{ event: 'whatsapp_click', cta_location: 'hero', cta_label: 'Conversar sobre meu filho' }]);
});

test('area cards show only icon, category, title and summary with no expand affordance', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#areas [data-area-card]');
  await expect(cards).toHaveCount(6);
  await expect(page.locator('#areas [data-flip-card], #areas .card-front, #areas .card-back, #areas .card-toggle, #areas .area-card__details')).toHaveCount(0);
  for (const card of await cards.all()) {
    const area = (await card.getAttribute('data-area'))!;
    await expect(card.locator('.area-card__icon svg')).toHaveCount(1);
    await expect(card.locator('h3')).toHaveText(area);
    await expect(card.locator('.area-card__summary')).toBeVisible();
    await expect(card.getByRole('button')).toHaveCount(0);
    await expect(card.getByText('NA AVALIAÇÃO')).toHaveCount(0);
  }
});

test('area cards render identically without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  const cards = page.locator('#areas [data-area-card]');
  await expect(cards).toHaveCount(6);
  for (const card of await cards.all()) {
    await expect(card.locator('.area-card__summary')).toBeVisible();
    await expect(card.getByRole('button')).toHaveCount(0);
    await expect(card).toHaveCSS('transform', 'none');
  }
  await context.close();
});

test('area card hover motion (lift, bar, icon scale) is inert with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  const card = page.locator('#areas [data-area-card]').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS('transform', 'none');
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card.locator('.area-card__icon')).toHaveCSS('transform', 'none');
  await expect(card.locator('h3')).toHaveCSS('transform', 'none');
  await context.close();
});

// Iris 11.b A-01: six boxed cards with an identical check icon read as a template; replaced with a
// left-aligned editorial list (2 columns, hairline divider, one icon per area from the logo's pictograms).
for (const width of [1024, 1440, 1920]) {
  test(`area cards keep a readable two-column list at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('#areas')).toHaveCount(1);
    const cards = page.locator('#areas [data-area-card]');
    await expect(cards).toHaveCount(6);
    const boxes = await cards.evaluateAll(elements => elements.map(element => {
      const { x, y, width, bottom } = element.getBoundingClientRect();
      return { x, y, width, bottom };
    }));
    // Two columns, three rows: items 0/1 share a row, 2/3 the next, 4/5 the last.
    for (const row of [0, 1, 2]) {
      const left = boxes[row * 2]!;
      const right = boxes[row * 2 + 1]!;
      expect(right.y).toBe(left.y);
      expect(right.x).toBeGreaterThan(left.x + left.width);
    }
    expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.bottom);
    expect(boxes[4]!.y).toBeGreaterThan(boxes[2]!.bottom);
    for (const card of await cards.all()) {
      expect(await card.locator('.area-card__summary').evaluate(element => element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

// Catches a regression back to boxed centered cards, or a hover that lifts/shadows instead of just
// marking the divider (the flat list has no card surface left to lift).
test('area cards are a left-aligned, unboxed list and hover only marks the divider', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const card = page.locator('#areas [data-area-card]').first();
  // See the comment on the signal/FAQ equivalents: settle the reveal under reduced motion first so the
  // entrance transition can't still be running when hover() fires below.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await card.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(card).toHaveClass(/is-visible/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await expect(card).toHaveCSS('text-align', 'left');
  await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(card).toHaveCSS('border-radius', '0px');
  await expect(card).toHaveCSS('border-top-color', 'rgba(48, 86, 106, 0.12)');
  await expect(card.locator('.area-card__icon')).toHaveCSS('color', 'rgb(141, 128, 95)');
  await expect(card.locator('h3')).toHaveCSS('font-family', /Figtree/);
  await expect(card.locator('.area-card__summary')).toHaveCSS('font-size', '15px');
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('box-shadow', 'none');

  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('box-shadow', 'none');
  await expect(card).toHaveCSS('border-top-color', 'rgba(48, 86, 106, 0.24)');
});

// Catches the signal cards drifting from the Areas card motion: same staggered entrance, same hover, same timing.
test('signal cards reuse the Areas staggered entrance and hover motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const list = page.locator('.signals__list');
  const cards = list.locator(':scope > li.signal-item[data-motion-card][data-reveal]');
  await expect(list).toHaveAttribute('data-reveal-stagger', '');
  await expect(cards).toHaveCount(6);
  await expect(page.locator('#areas .areas__grid > li[data-motion-card][data-reveal]')).toHaveCount(6);

  // Before entering the viewport: hidden and offset exactly like a pending Areas card, with the same per-card delays.
  const readPending = (locator: Locator) => locator.evaluateAll(elements => elements.map(element => {
    const computed = getComputedStyle(element);
    return { opacity: computed.opacity, transform: computed.transform, delay: computed.getPropertyValue('--reveal-delay').trim() };
  }));
  // The pending offset itself eases in through the cards' base transform transition, so read it once settled.
  await expect(cards.first()).toHaveClass(/reveal-pending/);
  for (const card of await page.locator('[data-motion-card]').all()) await settled(card);
  const signalPending = await readPending(cards);
  const areaPending = await readPending(page.locator('#areas [data-motion-card]'));
  expect(signalPending.map(card => [card.opacity, card.transform])).toEqual(Array(6).fill(['0', 'matrix(1, 0, 0, 1, 0, 20)']));
  expect(signalPending).toEqual(areaPending);
  expect(signalPending.map(card => toMilliseconds(card.delay))).toEqual([0, 60, 120, 180, 240, 300]);

  // Record when each card starts to appear: later cards must start later (the stagger), and all end fully visible.
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.signals__list > [data-motion-card]'));
    const started: (number | null)[] = items.map(() => null);
    (window as unknown as { signalRevealStarts: (number | null)[] }).signalRevealStarts = started;
    const sample = (time: number) => {
      items.forEach((item, index) => {
        if (started[index] === null && parseFloat(getComputedStyle(item).opacity) > 0.02) started[index] = time;
      });
      if (started.includes(null)) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await list.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(cards).toHaveClass(Array(6).fill(/is-visible/));
  await expect.poll(() => page.evaluate(() => (window as unknown as { signalRevealStarts: (number | null)[] }).signalRevealStarts.every(time => time !== null))).toBe(true);
  const starts = await page.evaluate(() => (window as unknown as { signalRevealStarts: number[] }).signalRevealStarts);
  for (let index = 1; index < starts.length; index += 1) expect(starts[index]!).toBeGreaterThanOrEqual(starts[index - 1]!);
  expect(starts[5]! - starts[0]!).toBeGreaterThanOrEqual(150);
  for (const card of await cards.all()) {
    await settled(card);
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveClass(/is-settled/);
  }

  // Hover: same lift, border and shadow as Areas; title and description no longer shift on their own.
  const card = cards.first();
  const restingShadow = await card.evaluate(element => getComputedStyle(element).boxShadow);
  await card.hover();
  await expect.poll(() => card.evaluate(element => getComputedStyle(element).transform)).toBe('matrix(1, 0, 0, 1, 0, -2)');
  await expect(card.locator('h3')).toHaveCSS('transform', 'none');
  await expect(card.locator('p')).toHaveCSS('transform', 'none');
  await expect.poll(() => card.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe(restingShadow);
  await expect(card).toHaveCSS('border-top-color', 'rgba(48, 86, 106, 0.24)');
  await expect(card).toHaveCSS('transition-duration', '0.3s, 0.3s, 0.3s');
});

// Catches signal card motion ignoring the reduced-motion preference.
test('signal card entrance and hover motion are inert with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  const cards = page.locator('.signals__list > [data-motion-card]');
  await expect(cards).toHaveCount(6);
  for (const card of await cards.all()) {
    await expect(card).not.toHaveClass(/reveal-pending/);
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveCSS('transform', 'none');
  }
  const card = cards.first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card.locator('h3')).toHaveCSS('transform', 'none');
  await expect(card.locator('p')).toHaveCSS('transform', 'none');
  await context.close();
});

test('renders the desktop page without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main#conteudo')).toBeVisible();
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBe(sizes.viewport);
});

test('signals lists every sign open beside the preserved portrait with a centered peach CTA', async ({ page }) => {
  await page.goto('/');

  const signals = page.locator('section.signals');
  const layout = signals.locator('.signals__layout');
  const portrait = signals.locator('.signals__portrait img');
  const items = signals.locator('.signals__list > li.signal-item');
  const reassurance = signals.locator('.signals__reassurance');
  const cta = signals.locator('.signals__action .button');

  await expect(layout).toHaveCount(1);
  await expect(portrait).toHaveAttribute('src', /\/_astro\/sinais-maisa\..+\.webp$/);
  await expect(portrait).toHaveAttribute(
    'alt',
    'Maisa Palma segurando um brinquedo de dinossauro no consultório.',
  );
  await expect(items).toHaveCount(6);
  await expect(items.getByRole('heading', { level: 3 })).toHaveText([
    'Fala pouco',
    'Troca ou omite sons',
    'Nem sempre é compreendida',
    'Fica frustrada ao tentar falar',
    'Entende, mas não consegue responder',
    'Evita participar de conversas',
  ]);
  await expect(items.locator('p')).toHaveText([
    'Você tem dúvidas sobre a quantidade de palavras ou a formação de frases para a idade do seu filho.',
    'Algumas palavras ficam difíceis de entender no dia a dia.',
    'Pessoas próximas pedem para repetir com frequência.',
    'Chora, se irrita ou desiste quando não consegue se expressar.',
    'Parece compreender, porém encontra dificuldade para organizar a fala.',
    'Você percebe que a criança se incomoda ou deixa de participar quando precisa falar.',
  ]);
  // Always open: no accordion, indicator, icon or number, and every description is visible without interaction.
  await expect(signals.locator('[data-signal-icon], .signal-card__number, details, summary, .signal-item__indicator')).toHaveCount(0);
  for (const description of await items.locator('p').all()) await expect(description).toBeVisible();

  await expect(reassurance).toHaveText('Um sinal isolado não define um diagnóstico. A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.');
  await expect(reassurance).toHaveCSS('background-color', 'rgb(227, 240, 242)');
  // Iris 11.b A-12: caps read as a clinical form for a list of parental worries; plain sentence case now.
  await expect(items.first().getByRole('heading', { level: 3 })).toHaveCSS('text-transform', 'none');
  await expect(cta).toHaveClass(/button--peach/);
  await expect(cta).toHaveCSS('background-image', /gradient/);
});

test('evaluation intro and signal titles use the calm navy language and signals add no extra tab stops', async ({ page }) => {
  await page.goto('/');
  const evaluationIntro = page.locator('#avaliacao .evaluation__intro');
  await expect(evaluationIntro.locator('.section-eyebrow')).toHaveCSS('color', 'rgb(48, 86, 106)');
  await expect(evaluationIntro.locator('.section-heading')).toHaveCSS('color', 'rgb(48, 86, 106)');
  await expect(evaluationIntro.locator('.section-description')).toHaveCSS('color', 'rgb(48, 86, 106)');

  // Read after any running transition finishes, so a mid-transition value cannot pass or fail by timing.
  const titles = page.locator('.signals__list .signal-item__title');
  await expect(titles).toHaveCount(6);
  await titles.first().hover();
  await settled(titles.first());
  for (const title of await titles.all()) await expect(title).toHaveCSS('color', 'rgb(48, 86, 106)');
  await expect(page.locator('.signals__list').locator('a, button, summary, [tabindex]')).toHaveCount(0);
});

test('signals stacks the portrait above the accordion before the two-column layout becomes cramped', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/');

  const intro = (await page.locator('.signals__intro').boundingBox())!;
  const portrait = (await page.locator('.signals__portrait').boundingBox())!;
  const list = (await page.locator('.signals__list').boundingBox())!;

  expect(portrait.y).toBeGreaterThanOrEqual(intro.y + intro.height + 32);
  expect(list.y).toBeGreaterThanOrEqual(portrait.y + portrait.height + 32);
});

test('uses Fraunces for display headings, Figtree elsewhere, and keeps accessible desktop CTA size', async ({ page }) => {
  await page.goto('/');

  const heading = page.locator('.section-heading').first();
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('font-family', /Fraunces/);
  await expect(page.locator('body')).toHaveCSS('font-family', /Figtree/);

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
    await expect(image).toHaveAttribute('src', /\/_astro\/hero\..+\.webp$/);
    await expect(image).toHaveCSS('object-fit', 'cover');
    expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const cta = hero.getByRole('link', { name: 'Conversar sobre meu filho', exact: true });
    await expect(cta).toBeInViewport({ ratio: 1 });
    await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
    // Iris 11.b A-08: the text column is now .9fr/1.1fr (was 1fr/1fr) so the H1 fits in 2 lines instead
    // of 3, which starts the text column a little left of the exact half — still clearly the right side.
    const headline = await hero.locator('h1').boundingBox();
    expect(headline!.x).toBeGreaterThanOrEqual(width * 0.4);
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
    const cta = header.getByRole('link', { name: 'WhatsApp', exact: true });
    await expect(cta).toBeInViewport({ ratio: 1 });
    await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
    if (await cta.getAttribute('href') === '#contato') {
      await cta.click();
      await expect(page).toHaveURL(/#contato$/);
    }
    const heroCta = page.locator('.hero').getByRole('link', { name: 'Conversar sobre meu filho', exact: true });
    if (await heroCta.getAttribute('href') === '#contato') {
      await heroCta.click();
      await expect(page).toHaveURL(/#contato$/);
    }
  });
}

test('header overlays the hero from the page top while scrolling state changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.getByRole('banner');
  const hero = page.locator('section.hero');
  await expect(header).toHaveCSS('position', 'sticky');
  const initial = await header.boundingBox();
  expect(initial!.y).toBe(0);
  expect((await hero.boundingBox())!.y).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 120));
  await expect(header).toHaveAttribute('data-scrolled', 'true');
  const scrolled = await header.boundingBox();
  expect(scrolled!.y).toBe(0);
  expect(scrolled!.height).toBe(initial!.height);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveAttribute('data-scrolled', 'false');
});

// Catches low-contrast navigation links or an accidental color change to the header CTA.
test('header navigation links are white while the peach CTA keeps its existing dark text', async ({ page }) => {
  await page.goto('/');
  const header = page.getByRole('banner');

  for (const link of await header.locator('.site-header__nav a').all()) {
    await expect(link).toHaveCSS('color', 'rgb(247, 242, 238)');
  }
  await expect(header.getByRole('link', { name: 'WhatsApp', exact: true })).toHaveCSS('color', 'rgb(69, 63, 59)');
});

test('scrolling down collapses the header to a hover rail and pointer reveals it again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto('/');
  const header = page.getByRole('banner');

  await page.evaluate(() => window.scrollTo(0, 180));
  await expect(header).toHaveAttribute('data-hidden', 'true');
  expect((await header.boundingBox())!.y).toBeLessThanOrEqual(-70);

  await page.mouse.move(720, 6);
  await expect(header).toHaveAttribute('data-hovered', 'true');
  await expect(header).toHaveAttribute('data-hidden', 'false');
  await expect(header.getByRole('link', { name: 'WhatsApp', exact: true })).toBeInViewport({ ratio: 1 });

  await page.mouse.move(720, 300);
  await expect(header).toHaveAttribute('data-hovered', 'false');
  await expect(header).toHaveAttribute('data-hidden', 'true');
});

test('header stays genuinely glass-transparent and CTAs retain a restrained visible glow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto('/');
  const header = page.getByRole('banner');
  await expect(header).toHaveCSS('background-color', 'rgba(247, 242, 238, 0.15)');
  await expect(header).toHaveCSS('backdrop-filter', /blur/);

  await page.evaluate(() => window.scrollTo(0, 120));
  await expect(header).toHaveAttribute('data-scrolled', 'true');
  await expect(header).toHaveCSS('background-color', 'rgba(247, 242, 238, 0.15)');

  for (const button of [page.locator('.hero .button'), page.locator('.signals .button--peach')]) {
    await expect(button).toBeVisible();
    await expect(button).toHaveCSS('box-shadow', /rgb/);
    await expect(button).toHaveCSS('background-image', /gradient/);
  }
});

// Catches reveal code that hides server-rendered content, skips the observer callback,
// or staggers an entire six-card grid instead of each desktop row.
test('progressive reveals keep content visible by default and reveal area rows in short staggered groups', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const cards = page.locator('#areas [data-area-card][data-reveal]');
  await expect(cards).toHaveCount(6);
  await expect(cards.first()).toHaveClass(/reveal-pending/);
  const delays = await cards.evaluateAll(elements => elements.map(element => getComputedStyle(element).getPropertyValue('--reveal-delay').trim()));
  // The production minifier rewrites `100ms` as `.1s`; compare durations, not spellings.
  expect(delays.map(toMilliseconds)).toEqual([0, 60, 120, 180, 240, 300]);

  await cards.first().scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveClass(/is-visible/);
  await expect(cards.first()).not.toHaveClass(/reveal-pending/);
  await expect(cards.first()).toHaveCSS('opacity', '1');
  await expect(cards.first()).toHaveCSS('transition-delay', '0s');
});

test('reveal targets remain readable with JavaScript disabled or reduced motion enabled', async ({ browser }) => {
  const noJavaScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noJavaScriptPage = await noJavaScript.newPage();
  await noJavaScriptPage.goto('/');
  expect(await noJavaScriptPage.locator('[data-reveal]').evaluateAll(elements =>
    elements.every(element => !element.classList.contains('reveal-pending')),
  )).toBe(true);
  await expect(noJavaScriptPage.locator('#areas .area-card').first()).toBeVisible();
  await expect(noJavaScriptPage.locator('#areas').getByRole('heading', { level: 2 })).toBeVisible();
  await expect(noJavaScriptPage.locator('#areas').getByRole('link')).toBeVisible();
  await noJavaScript.close();

  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('/');
  const reveal = reducedPage.locator('#areas [data-reveal]').first();
  await expect(reveal).toBeVisible();
  await expect(reveal).not.toHaveClass(/reveal-pending/);
  expect(await reveal.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration) <= 0.01)).toBe(true);
  await reduced.close();
});

test('hero message and CTA remain available when the photograph cannot load', async ({ page }) => {
  await page.route('**/_astro/hero.*', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Cada pequena voz merece ser ouvida.' })).toBeVisible();
  await expect(page.locator('.hero').getByRole('link', { name: 'Conversar sobre meu filho', exact: true })).toBeInViewport({ ratio: 1 });
});

test('FAQ publishes all answers with one native accordion item open and keyboard controls', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('section#duvidas');
  const items = faq.locator('details[name="faq"]');
  const answers = [
    'É natural pensar assim — muitas crianças realmente evoluem sozinhas. Mas esperar sem uma avaliação pode adiar um cuidado que faria diferença agora. A avaliação não obriga a nada: ela mostra se há motivo para acompanhar de perto ou se está tudo dentro do esperado.',
    'Não existe uma idade mínima nem um prazo para "esperar mais um pouco". Cada fase do desenvolvimento tem marcos próprios, e a avaliação considera isso desde bebês até a fase escolar. Quanto antes a dúvida for esclarecida, mais cedo a família fica tranquila — em qualquer direção que a resposta apontar.',
    'O encontro é conduzido como uma brincadeira, com atividades escolhidas para a idade da criança — sem provas cronometradas ou cobrança. A maioria das crianças nem percebe que está sendo avaliada. Você acompanha de perto o tempo todo.',
    'Nem toda avaliação termina em indicação de terapia; às vezes o resultado mostra que está tudo dentro do esperado para a idade. Quando há indicação, ela vem com uma explicação clara do motivo e do que esperar do acompanhamento.',
    'Não existe um prazo padrão: depende da idade da criança, da queixa e da resposta ao trabalho ao longo do caminho. Esse tempo é revisado periodicamente com a família, para que vocês sempre saibam em que ponto do processo estão.',
    'Sim — a família é parte do trabalho, não apenas espectadora. Você recebe orientações práticas para o dia a dia e é ouvida sobre o que tem funcionado em casa, porque o que acontece fora do consultório também importa.',
    'O valor da avaliação é combinado diretamente pelo WhatsApp, de acordo com a necessidade de cada família.',
    'O atendimento acontece de segunda a sexta, das 8h às 18h. Fale pelo WhatsApp para agendar um horário.',
  ];

  await expect(items).toHaveCount(8);
  await expect(items.locator('summary')).toHaveCount(8);
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

// Catches structured data drifting from the visible FAQ copy.
test('FAQPage JSON-LD mirrors the visible questions and answers', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('section#duvidas');
  const schema = JSON.parse((await faq.locator('script[type="application/ld+json"]').textContent())!);
  const visible = await faq.locator('details[name="faq"]').evaluateAll(items => items.map(item => [
    item.querySelector('summary > span:first-child')!.textContent!.trim(),
    item.querySelector('[data-faq-answer]')!.textContent!.trim(),
  ]));
  expect(visible).toHaveLength(8);
  expect(schema['@context']).toBe('https://schema.org');
  expect(schema['@type']).toBe('FAQPage');
  expect(schema.mainEntity.map((entry: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }) => {
    expect([entry['@type'], entry.acceptedAnswer['@type']]).toEqual(['Question', 'Answer']);
    return [entry.name, entry.acceptedAnswer.text];
  })).toEqual(visible);
});

test('FAQ opening rotates the indicator and fades the answer in without changing its text', async ({ page }) => {
  await page.goto('/');
  const item = page.locator('section#duvidas details[name="faq"]').nth(1);
  const answer = item.locator('[data-faq-answer]');
  const indicator = item.locator('.faq__indicator');
  const expectedAnswer =
    'Não existe uma idade mínima nem um prazo para "esperar mais um pouco". Cada fase do desenvolvimento tem marcos próprios, e a avaliação considera isso desde bebês até a fase escolar. Quanto antes a dúvida for esclarecida, mais cedo a família fica tranquila — em qualquer direção que a resposta apontar.';
  await expect(indicator).toHaveCSS('transform', 'none');
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');
  await expect(answer).toHaveText(expectedAnswer);
  await expect.poll(() => indicator.evaluate(element => getComputedStyle(element).transform)).toMatch(/matrix\(-1, 0, 0, -1, 0, 0\)/);
  await expect.poll(() => answer.evaluate(element => getComputedStyle(element).opacity)).toBe('1');
});

test('FAQ answers remain readable without JavaScript and skip reveal motion when reduced', async ({ browser }) => {
  const noJavaScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noJavaScriptPage = await noJavaScript.newPage();
  await noJavaScriptPage.goto('/');
  const noJavaScriptFaq = noJavaScriptPage.locator('section#duvidas');
  await expect(noJavaScriptFaq.locator('details[name="faq"]')).toHaveCount(8);
  await noJavaScriptFaq.locator('details[name="faq"]').nth(4).locator('summary').click();
  await expect(noJavaScriptFaq.getByText('Não existe um prazo padrão: depende da idade da criança, da queixa e da resposta ao trabalho ao longo do caminho. Esse tempo é revisado periodicamente com a família, para que vocês sempre saibam em que ponto do processo estão.', { exact: true })).toBeVisible();
  await noJavaScript.close();

  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('/');
  const item = reducedPage.locator('section#duvidas details[name="faq"]').nth(1);
  const answer = item.locator('[data-faq-answer]');
  await item.locator('summary').click();
  await expect(answer).toHaveText(
    'Não existe uma idade mínima nem um prazo para "esperar mais um pouco". Cada fase do desenvolvimento tem marcos próprios, e a avaliação considera isso desde bebês até a fase escolar. Quanto antes a dúvida for esclarecida, mais cedo a família fica tranquila — em qualquer direção que a resposta apontar.',
  );
  await expect(answer).toHaveCSS('filter', 'none');
  expect(await answer.evaluate(element => parseFloat(getComputedStyle(element).animationDuration) <= 0.01)).toBe(true);
  await reduced.close();
});

// Iris 12.3 (A-11): the panel now carries the Dra.'s photo blended in via a CSS custom property (no
// <img>, luminosity blend keeps the panel navy) plus ambient light — .contact__glow/.contact__portrait
// were the old flat decoration this replaces, so their absence is now the expected state, not a bug.
test('contact CTA is a centered conversion panel with ambient light and the existing WhatsApp route', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const section = page.locator('section#contato');

  await expect(section).toHaveAttribute('aria-labelledby', 'contact-title');
  await expect(section.locator('#contact-title')).toHaveCount(1);
  await expect(section.locator('.contact__panel')).toBeVisible();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Você não precisa ter todas as respostas para começar uma conversa.');
  await expect(section.getByText('Conte pelo WhatsApp o que você tem observado na comunicação do seu filho. Por lá, você pode conhecer o atendimento e consultar os horários disponíveis para avaliação.', { exact: true })).toBeVisible();
  await expect(section.getByRole('link', { name: 'Conversar sobre meu filho', exact: true })).toHaveAttribute('href', /https:\/\/wa\.me\/5515992719708\?text=.+/);
  await expect(section.locator('.contact__portrait, img')).toHaveCount(0);
  await expect(section).toHaveAttribute('style', /--ambient:/);
  await expect(page.locator('section#conversar')).toHaveCount(0);
});

test('FAQ is centered while preserving its native accordion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const faq = page.locator('section#duvidas');
  const layout = faq.locator('.faq__layout');
  const styles = await layout.evaluate(element => getComputedStyle(element));
  expect(styles.textAlign).toBe('center');
  expect(parseFloat(styles.maxWidth)).toBeLessThanOrEqual(820);
  await expect(faq.locator('details[name="faq"]')).toHaveCount(8);
  await expect(faq.locator('details[name="faq"]').first()).toHaveAttribute('open', '');
});

// Iris 11.b A-07: maps no longer load by default (each iframe pulled hundreds of KB of third-party JS
// on arrival, for 3 clinics at once); "Como chegar" is a plain link and works with no JS or clicks.
test('last content section provides the three confirmed clinics with no map loaded by default', async ({ page }) => {
  await page.goto('/');
  const locations = page.locator('section#localizacoes');
  const cards = locations.locator('.location-card');

  await expect(locations.getByRole('heading', { level: 2 })).toHaveText('Onde encontrar o atendimento');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('.location-card__name')).toHaveText(['Clínica Senses', 'Clínica Sinapse', 'CliniPrev']);
  await expect(locations.locator('iframe')).toHaveCount(0);
  await expect(cards.locator('a', { hasText: 'Como chegar' })).toHaveCount(3);
  await expect(cards.getByRole('button', { name: /^Ver mapa da/ })).toHaveCount(3);
});

// Catches the map toggle failing to load a card's own map, or leaking into another card's state.
test('location cards load their map on demand, independently of one another', async ({ page }) => {
  await page.goto('/');
  const locations = page.locator('section#localizacoes');
  const cards = locations.locator('.location-card');
  const senses = cards.nth(0);
  const sinapse = cards.nth(1);
  // Located by the stable data attribute, not the accessible name: a successful load changes the
  // button's aria-label (and text) to "Mapa carregado", which would stop a name-based locator matching.
  const sensesToggle = senses.locator('[data-location-map-toggle]');

  await expect(sensesToggle).toHaveAccessibleName('Ver mapa da Clínica Senses');
  await expect(sensesToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(senses.locator('iframe')).toHaveCount(0);

  await sensesToggle.focus();
  await page.keyboard.press('Enter');

  await expect(sensesToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(senses.locator('iframe')).toBeVisible();
  await expect(senses.locator('iframe')).toHaveAttribute('loading', 'lazy');
  await expect(senses.locator('iframe')).toHaveAttribute('src', /Cl%C3%ADnica%20Senses/);
  await expect(sinapse.locator('iframe')).toHaveCount(0);

  const sinapseToggle = sinapse.locator('[data-location-map-toggle]');
  await expect(sinapseToggle).toHaveAccessibleName('Ver mapa da Clínica Sinapse');
  await sinapseToggle.click();
  await expect(sinapse.locator('iframe')).toBeVisible();
  await expect(sinapse.locator('iframe')).toHaveAttribute('src', /Cl%C3%ADnica%20Sinapse%20Itapeva/);
  await expect(senses.locator('iframe')).toHaveCount(1);
});

// Catches a missing practical contact route or unconfirmed operational data being published.
test('unified contact conversion and footer show the confirmed CRFa and hours without unconfirmed credentials', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('section#contato');
  const footer = page.getByRole('contentinfo');

  await expect(contact).toHaveCount(1);
  await expect(contact.getByRole('heading', { level: 2 })).toHaveText('Você não precisa ter todas as respostas para começar uma conversa.');
  await expect(contact.getByText('Conte pelo WhatsApp o que você tem observado na comunicação do seu filho. Por lá, você pode conhecer o atendimento e consultar os horários disponíveis para avaliação.', { exact: true })).toBeVisible();
  await expect(contact.getByRole('link', { name: 'Conversar sobre meu filho', exact: true })).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
  await expect(contact.getByText('Fonoaudiologia infantil em Itapeva–SP • @fonomaisapalma', { exact: true })).toBeVisible();
  await expect(contact.getByText('CRFa 2-23944', { exact: true })).toBeVisible();
  await expect(contact.getByText('Segunda a sexta, das 8h às 18h', { exact: true })).toBeVisible();
  await expect(contact.getByText(/CNPJ|Endereço/)).toHaveCount(0);

  await expect(footer).toHaveCount(1);
  await expect(footer.getByRole('img', { name: 'Maisa Palma — Fonoaudióloga' })).toBeVisible();
  await expect(footer.getByText('Fonoaudiologia infantil em Itapeva–SP', { exact: true })).toBeVisible();
  await expect(footer.getByRole('link', { name: '@fonomaisapalma', exact: true })).toHaveAttribute('href', 'https://instagram.com/fonomaisapalma');
  await expect(footer.getByText('CRFa 2-23944', { exact: true })).toBeVisible();
  await expect(footer.getByText(/CNPJ|Política de Privacidade/)).toHaveCount(0);

  // Iris 11.b A-15: footer carries hours and the 3 clinics (NAP consistent with the JSON-LD).
  await expect(footer.getByText('Segunda a sexta, das 8h às 18h', { exact: true })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Clínica Senses', exact: true })).toHaveAttribute('href', /goo\.gl|google/);
  await expect(footer.getByRole('link', { name: 'Clínica Sinapse', exact: true })).toHaveAttribute('href', /goo\.gl|google/);
  await expect(footer.getByRole('link', { name: 'CliniPrev', exact: true })).toHaveAttribute('href', /goo\.gl|google/);
});

// Catches stale fragment URLs, duplicate section ids, and anchors hidden under the sticky header.
test('every header and footer fragment link has one visible target below the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.getByRole('banner');
  const headerHeight = (await header.boundingBox())!.height;
  const links = await page.locator('.site-header__nav a[href^="#"], .site-header .button[href^="#"], footer nav a[href^="#"]').evaluateAll(elements =>
    [...new Set(elements.map(link => (link as HTMLAnchorElement).hash))],
  );

  expect(links.length).toBeGreaterThan(0);
  for (const hash of links) {
    const id = hash.slice(1);
    const target = page.locator(`#${id}`);
    await expect(target).toHaveCount(1);
    await page.locator(`.site-header__nav a[href="${hash}"], .site-header .button[href="${hash}"], footer nav a[href="${hash}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    const targetTop = await target.evaluate(element => element.getBoundingClientRect().top);
    expect(targetTop).toBeGreaterThanOrEqual(headerHeight);
    await expect(target.getByRole('heading').first()).toBeInViewport();
  }
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

    // Let the staggered card entrance finish so its transforms cannot offset the geometry below.
    const revealCards = signals.locator('.signals__list > [data-reveal]');
    await signals.locator('.signals__list').scrollIntoViewIfNeeded();
    await expect(revealCards).toHaveClass(Array(6).fill(/is-visible/));
    for (const card of await revealCards.all()) await settled(card);

    // Intro is centered above; the portrait column right of the card stack spans exactly from the first card's top to the last card's bottom.
    const intro = signals.locator('.signals__intro');
    const introCenter = await intro.evaluate(element => {
      const box = element.getBoundingClientRect();
      return box.left + box.width / 2;
    });
    for (const part of await intro.locator('.section-eyebrow, h2, .section-description').all()) {
      const box = (await part.boundingBox())!;
      expect(Math.abs(box.x + box.width / 2 - introCenter)).toBeLessThanOrEqual(1);
    }
    const portraitFrame = signals.locator('.signals__portrait');
    const list = signals.locator('.signals__list');
    const portraitBox = await pageBox(portraitFrame);
    const listBox = await pageBox(list);
    const introBox = await pageBox(intro);
    expect(portraitBox.y).toBeGreaterThanOrEqual(introBox.y + introBox.height);
    expect(listBox.x + listBox.width).toBeLessThan(portraitBox.x);
    expect(portraitBox.width).toBeGreaterThanOrEqual(320);
    expect(portraitBox.width).toBeLessThan(listBox.width);
    const firstCard = await pageBox(list.locator(':scope > li.signal-item').first());
    const lastCard = await pageBox(list.locator(':scope > li.signal-item').last());
    expect(Math.abs(portraitBox.y - firstCard.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(portraitBox.y + portraitBox.height - (lastCard.y + lastCard.height))).toBeLessThanOrEqual(1);

    // The photo fills the frame with object-fit: cover (cropped, never stretched) from a 4:5 source.
    const photo = await portraitFrame.locator('img').evaluate(async (img: HTMLImageElement) => {
      img.loading = 'eager';
      await img.decode();
      // <Picture> wraps the img in a <picture> element, so the frame is the nearest .picture-frame, not the direct parent.
      const frameElement = img.closest('.picture-frame')!;
      const frame = frameElement.getBoundingClientRect();
      const box = img.getBoundingClientRect();
      const style = getComputedStyle(img);
      return {
        objectFit: style.objectFit,
        // srcset density correction rounds natural sizes by a pixel, so compare the ratio to two decimals.
        sourceRatio: Math.round((img.naturalWidth / img.naturalHeight) * 100) / 100,
        fills: Math.abs(box.width - frame.width) <= 1 && Math.abs(box.height - frame.height) <= 1,
        radius: getComputedStyle(frameElement).borderTopLeftRadius,
      };
    });
    expect(photo).toEqual({ objectFit: 'cover', sourceRatio: 0.8, fills: true, radius: '24px' });
    expect(await list.evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
    const action = await pageBox(signals.locator('.signals__action'));
    expect(action.y).toBeGreaterThanOrEqual(listBox.y + listBox.height);

    const cards = list.locator(':scope > li.signal-item');
    await expect(cards).toHaveCount(6);
    await expect(list).toHaveCSS('border-top-width', '0px');
    // Cards keep their own card border/radius/shadow (Areas dropped its card surface entirely in A-01,
    // so it's no longer a shared reference); background is translucent white so the ambient light behind
    // the section (Iris 12.3) shows through. Title stays navy, description smaller graphite.
    const signalCardShadow = await cards.first().evaluate(element => getComputedStyle(element).boxShadow);
    for (const card of await cards.all()) {
      await expect(card).toHaveCSS('border-top-style', 'solid');
      await expect(card).toHaveCSS('border-top-width', '1px');
      await expect(card).toHaveCSS('border-top-left-radius', '24px');
      await expect(card).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.78)');
      await expect(card).toHaveCSS('padding-top', '16px');
      expect(await card.evaluate(element => getComputedStyle(element).boxShadow)).toBe(signalCardShadow);
      await expect(card.locator('h3')).toHaveCSS('color', 'rgb(48, 86, 106)');
      await expect(card.locator('h3')).toHaveCSS('font-weight', '600');
      const description = card.locator('p');
      await expect(description).toBeVisible();
      await expect(description).toHaveCSS('font-size', '14px');
      await expect(description).toHaveCSS('color', 'rgb(74, 69, 65)');
      expect(await description.evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
    }

    const boxes = await cards.evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom };
    }));
    for (let index = 0; index < boxes.length; index += 1) {
      expect(Math.abs(boxes[index]!.x - boxes[0]!.x)).toBeLessThan(1);
      expect(Math.abs(boxes[index]!.width - boxes[0]!.width)).toBeLessThan(1);
      if (index > 0) expect(Math.abs(boxes[index]!.y - boxes[index - 1]!.bottom - 12)).toBeLessThanOrEqual(1);
    }

    for (const section of [signals, about]) {
      const portrait = section.locator('.picture-frame img');
      await portrait.scrollIntoViewIfNeeded();
      await expect(portrait).toBeVisible();
      await expect(portrait).toHaveCSS('object-fit', 'cover');
      await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      // The About portrait keeps its 4:5 box; the Signals frame is stretched to the card stack (checked above).
      if (section === about) {
        const bounds = (await portrait.boundingBox())!;
        expect(bounds.width / bounds.height).toBeCloseTo(4 / 5, 2);
      }
      const cta = section.getByRole('link');
      if (section === about) {
        // About's CTA is a secondary internal link to the evaluation section, not a WhatsApp CTA.
        await expect(cta).toHaveAttribute('href', '#avaliacao');
      } else {
        await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
      }
    }

    const textBlocks = page.locator('.signals h2, .signal-item__title, .signal-item p, .about h2');
    for (const block of await textBlocks.all()) {
      await expect(block).toBeVisible();
      const geometry = await block.evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const text = range.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          textFitsHorizontally: text.left >= box.left - 1 && text.right <= box.right + 1,
          verticalContentVisible: text.bottom <= box.bottom + 2 || style.overflowY === 'visible',
          widthFits: element.scrollWidth <= element.clientWidth + 1,
        };
      });
      expect(geometry, `Text must fit without clipping: ${await block.innerText()}`).toEqual({
        textFitsHorizontally: true,
        verticalContentVisible: true,
        widthFits: true,
      });
    }
    const pageWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(pageWidth.content).toBe(pageWidth.viewport);
  });
}

// Catches a static CTA: the panel must translate/scale with scroll progress. The old cream-page blobs
// and dot grid backdrop (Iris 11.b A-11) are gone — the panel's own ambient light (Iris 12.3) replaces
// them, and that light is a static, non-parallaxing layer, so there's no separate backdrop to assert on.
test('contact CTA moves with scroll progress and settles centered near its scale peak', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const section = page.locator('section#contato');
  const layout = section.locator('.contact__layout[data-cta]');
  await expect(section).toHaveAttribute('data-cta-scroll', '');
  await expect(section.locator('.contact__backdrop, .contact__blob, .contact__dots')).toHaveCount(0);

  const readProgress = () => section.evaluate(element => parseFloat(getComputedStyle(element).getPropertyValue('--cta-progress')));
  const readMatrix = () => layout.evaluate(element => getComputedStyle(element).transform);

  // Section just entering from the bottom: progress near 0, panel pushed down and shrunk.
  await section.evaluate(element => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - window.innerHeight + 40);
  });
  await expect.poll(readProgress, { timeout: 3000 }).toBeLessThan(0.15);
  const entering = await readMatrix();
  expect(entering).not.toBe('none');
  const enteringScale = parseFloat(entering.replace('matrix(', '').split(',')[0]!);
  expect(enteringScale).toBeLessThan(0.98);

  // Section centered: progress near 0.5, scale back to ~1.
  await section.evaluate(element => {
    const box = element.getBoundingClientRect();
    window.scrollTo(0, box.top + window.scrollY - (window.innerHeight - box.height) / 2);
  });
  await expect.poll(readProgress, { timeout: 3000 }).toBeGreaterThan(0.4);
  await expect.poll(readProgress, { timeout: 3000 }).toBeLessThan(0.6);
  await expect.poll(async () => parseFloat((await readMatrix()).replace('matrix(', '').split(',')[0]!), { timeout: 3000 }).toBeGreaterThan(0.97);
});

test('contact CTA motion is inert with reduced motion and without JavaScript', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('/');
  const layout = reducedPage.locator('section#contato .contact__layout[data-cta]');
  await layout.scrollIntoViewIfNeeded();
  await expect(layout).toHaveCSS('transform', 'none');
  await expect(reducedPage.locator('section#contato .section-heading')).toHaveCSS('opacity', '1');
  await reduced.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto('/');
  const panel = noJsPage.locator('section#contato .contact__panel');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toBeVisible();
  await expect(noJsPage.locator('section#contato .section-heading')).toHaveCSS('opacity', '1');
  await expect(noJsPage.locator('section#contato').getByRole('link', { name: 'Conversar sobre meu filho', exact: true })).toBeVisible();
  await noJs.close();
});
