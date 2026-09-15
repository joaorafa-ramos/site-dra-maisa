import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });

// Catches an empty anchor, client-only rendering, a lost step or missing reassurance/CTA.
test('evaluation provides the complete ordered journey and scheduling action without JavaScript', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section#avaliacao');
  await expect(page.locator('#avaliacao')).toHaveCount(1);
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Um primeiro passo leve, claro e pensado para o seu filho.');
  await expect(section).toHaveAttribute('data-reveal-group', 'evaluation');
  const steps = section.locator('ol > li');
  await expect(steps).toHaveCount(3);
  const expected = [
    ['Conversa com a família', 'Começamos ouvindo você: a rotina, o histórico do desenvolvimento e as situações que mais preocupam a família.'],
    ['Avaliação lúdica', 'Por meio de recursos e protocolos adequados à idade e à queixa, a Dra. Maisa observa como a criança compreende, interage e se comunica.'],
    ['Devolutiva e próximos passos', 'Você recebe uma explicação clara sobre o que foi observado e, quando indicado, uma proposta de acompanhamento individualizado.'],
  ];
  for (const [index, [title, description]] of expected.entries()) {
    await expect(steps.nth(index).getByRole('heading', { level: 3 })).toHaveText(title!);
    await expect(steps.nth(index).getByText(description!, { exact: true })).toBeVisible();
  }
  const reassurance = section.getByText('Não há respostas certas ou erradas. A avaliação é conduzida com atenção, acolhimento e respeito ao modo de cada criança se comunicar.', { exact: true });
  await expect(reassurance).toBeVisible();
  const cta = page.getByRole('link', { name: 'Quero agendar uma avaliação', exact: true });
  await expect(cta).toHaveCount(1);
  await expect(section.getByRole('link', { name: 'Quero agendar uma avaliação', exact: true })).toBeVisible();
  await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
  await expect(section.getByText('A conversa é iniciada pelo WhatsApp.', { exact: true })).toBeVisible();
  const listBox = (await section.locator('ol').boundingBox())!;
  expect((await reassurance.boundingBox())!.y).toBeGreaterThan(listBox.y + listBox.height);
});

// Catches accidental reintroduction of the removed section while preserving the adjacent journey.
test('the removed benefits section is absent while the evaluation journey remains visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section.benefits')).toHaveCount(0);
  await expect(page.locator('#avaliacao')).toBeVisible();
  await expect(page.locator('#areas')).toBeVisible();
});

for (const width of [1024, 1280, 1440, 1920]) {
  // Catches collapsed timeline columns, broken connectors, clipped copy and undersized type.
  test(`evaluation and areas preserve readable desktop geometry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const steps = page.locator('#avaliacao ol > li');
    await expect(steps).toHaveCount(3);
    const boxes = await steps.evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width };
    }));
    for (let index = 1; index < 3; index++) {
      expect(Math.abs(boxes[index]!.y - boxes[0]!.y)).toBeLessThan(1);
      expect(Math.abs(boxes[index]!.width - boxes[0]!.width)).toBeLessThan(1);
      expect(boxes[index]!.x).toBeGreaterThan(boxes[index - 1]!.x + boxes[index - 1]!.width);
    }
    const markers = page.locator('.evaluation-step__number');
    const line = (await page.locator('.evaluation__line').boundingBox())!;
    const first = (await markers.first().boundingBox())!;
    const last = (await markers.last().boundingBox())!;
    expect(line.height).toBeGreaterThan(0);
    expect(Math.abs(line.y + line.height / 2 - first.y - first.height / 2)).toBeLessThan(2);
    expect(line.x).toBeLessThanOrEqual(first.x + first.width / 2);
    expect(line.x + line.width).toBeGreaterThanOrEqual(last.x + last.width / 2);

    for (const element of await page.locator('#avaliacao h3, #avaliacao li p, .area-card h3, .area-card .area-card__summary').all()) {
      await expect(element).toBeVisible();
      const geometry = await element.evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const text = range.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return {
          fontSize: parseFloat(getComputedStyle(element).fontSize),
          heading: element.tagName === 'H3',
          fits: text.left >= box.left - 1 && text.right <= box.right + 1 && text.bottom <= box.bottom + 2 && element.scrollWidth <= element.clientWidth + 1,
        };
      });
      expect(geometry.fontSize).toBeGreaterThanOrEqual(geometry.heading ? 20 : 16);
      expect(geometry.fits).toBe(true);
    }
    const pageWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(pageWidth.content).toBe(pageWidth.viewport);
  });
}
