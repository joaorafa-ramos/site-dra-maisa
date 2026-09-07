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
  const reassurance = section.getByText('A criança não precisa “acertar” nada. A avaliação é um momento de observação, vínculo e compreensão.', { exact: true });
  await expect(reassurance).toBeVisible();
  const cta = page.getByRole('link', { name: 'Quero agendar uma avaliação', exact: true });
  await expect(cta).toHaveCount(1);
  await expect(section.getByRole('link', { name: 'Quero agendar uma avaliação', exact: true })).toBeVisible();
  await expect(cta).toHaveAttribute('href', /^(#contato|https:\/\/wa\.me\/\d+\?text=.+)$/);
  await expect(section.getByText('A conversa é iniciada pelo WhatsApp.', { exact: true })).toBeVisible();
  const listBox = (await section.locator('ol').boundingBox())!;
  expect((await reassurance.boundingBox())!.y).toBeGreaterThan(listBox.y + listBox.height);
});

// Catches hidden/flip content, missing benefits, and accidental interactive wrappers.
test('all five benefits are readable without JavaScript or interaction', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section.benefits');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Cada criança tem seu jeito de se comunicar. O atendimento também precisa respeitar isso.');
  const items = section.locator('ul > li');
  await expect(items).toHaveCount(5);
  const expected = [
    ['Avaliação individualizada', 'Um olhar atento para compreender a criança além da queixa inicial.'],
    ['Estratégias lúdicas', 'Brincadeiras e recursos adequados à idade tornam a sessão mais natural.'],
    ['Respeito ao ritmo da criança', 'Cada avanço é construído sem comparações e com objetivos possíveis.'],
    ['Orientações claras para a família', 'Você entende o que está sendo trabalhado e como apoiar no dia a dia.'],
    ['Objetivos terapêuticos claros', 'Com brincadeiras, vínculo e objetivos terapêuticos claros, construímos um caminho para que ela possa se comunicar com mais segurança.'],
  ];
  for (const [index, [title, description]] of expected.entries()) {
    await expect(items.nth(index)).toBeVisible();
    await expect(items.nth(index).getByRole('heading', { level: 3 })).toHaveText(title!);
    await expect(items.nth(index).getByText(description!, { exact: true })).toBeVisible();
  }
  await expect(section.locator('a, button, input, select, textarea, summary, [role="button"], [tabindex]')).toHaveCount(0);
});

for (const width of [1024, 1280, 1440, 1920]) {
  // Catches collapsed timeline columns, broken connectors, clipped copy and undersized type.
  test(`evaluation and benefits preserve readable desktop geometry at ${width}px`, async ({ page }) => {
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

    for (const element of await page.locator('#avaliacao h3, #avaliacao li p, .benefits h3, .benefits li p').all()) {
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
