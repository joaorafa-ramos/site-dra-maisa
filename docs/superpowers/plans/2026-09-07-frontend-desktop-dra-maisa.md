# Frontend Desktop — Site Dra. Maisa Palma Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o frontend desktop completo do site da Dra. Maisa Palma com fidelidade à página `Revisão UX e Conversão` do Figma, priorizando confiança, leitura tranquila e conversão para o WhatsApp.

**Architecture:** Criar um site estático em Astro com TypeScript, componentes por seção e CSS próprio. O HTML será renderizado no servidor; somente flip cards, FAQ, header fixo e entradas por rolagem receberão JavaScript progressivo. A estrutura deve aceitar o mobile futuramente sem exigir reescrita do conteúdo ou das interações.

**Tech Stack:** Astro 5, TypeScript estrito, CSS nativo, fontes locais via `@fontsource`, JavaScript nativo para interações, Vitest para lógica pura e Playwright para fluxos desktop.

**Spec:** `arquitetura-site-gemini.md`, `docs/revisao-2026-09-06/revisao-completa.md` e [Figma — seção 8 da versão revisada](https://www.figma.com/design/QSGppkOvBuYHgzfzvUeDJP?node-id=114-2).

## Global Constraints

- Implementar somente desktop nesta etapa. Suportar larguras de viewport de `1024px` a `1920px`; não criar menu mobile, empilhamentos mobile ou regras específicas abaixo de `1024px`.
- Usar como fonte visual a página `Revisão UX e Conversão` do arquivo Figma `QSGppkOvBuYHgzfzvUeDJP`. A página `Original — referência` serve apenas para comparação.
- O nó `114:2` é a fonte obrigatória da seção 8: copy à esquerda e área de foto `350 × 438px`, proporção `4:5`, à direita.
- Largura de referência: `1440px`. Container principal: `1120px`, centralizado, com `padding-inline: 32px` entre `1024px` e `1199px`.
- Tipografia: `Newsreader SemiBold` em títulos e `Manrope` em textos, navegação, botões e rótulos.
- Paleta: creme `#F7F2EE`, azul-claro `#E3F0F2`, azul-petróleo `#30566A`, grafite `#4A4541`, oliva `#8D805F`, pêssego `#D7A98D` e texto de botão sobre pêssego `#453F3B`.
- Todo texto deve ser HTML real. A headline não pode ser gravada na imagem da hero.
- CTA principal: `Conversar pelo WhatsApp`. A exceção intencional é `Quero agendar uma avaliação` na seção do processo de avaliação.
- A mensagem pré-preenchida do WhatsApp será: `Olá! Gostaria de conversar sobre a comunicação do meu filho e saber como funciona a avaliação fonoaudiológica.`
- Não inventar telefone, endereço, CRFa, CNPJ, titulação, horário ou serviço. Campos não confirmados devem ser omitidos visualmente e registrados no checklist de publicação.
- O logotipo deve vir de `logo.maisa.pdf`, usando a versão raster transparente já extraída em `tmp/pdfs/logo-maisa-transparent.png` como fonte de produção.
- Hero: usar `design-builder-5e71b5bb.png`. Apresentação: usar `secao-apresentacao-definitivo.png`.
- As demais imagens ainda são provisórias. Manter um único caminho por slot para permitir troca sem alterar o componente.
- Movimento discreto: entrada de `10–12px`, `420–480ms`, `ease-out`; flip de `560ms`; sem parallax, bounce, brilho, cursor magnético ou animação letra por letra.
- Respeitar `prefers-reduced-motion: reduce`; nenhuma informação ou ação pode depender da animação.
- Meta de qualidade desktop: Lighthouse Performance ≥ 90 e Accessibility/SEO/Best Practices ≥ 95 em build de produção, sem erro de console e sem rolagem horizontal em `1024`, `1280`, `1366`, `1440` e `1920px`.

---

## File Map

```text
.
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── logo-maisa.png
│       ├── hero-maisa.webp
│       ├── sinais-maisa.webp
│       ├── apresentacao-maisa.webp
│       └── conversao-maisa.webp
├── src/
│   ├── components/
│   │   ├── layout/Header.astro
│   │   ├── layout/Footer.astro
│   │   ├── sections/Hero.astro
│   │   ├── sections/Signals.astro
│   │   ├── sections/About.astro
│   │   ├── sections/Evaluation.astro
│   │   ├── sections/Benefits.astro
│   │   ├── sections/Areas.astro
│   │   ├── sections/Faq.astro
│   │   ├── sections/FinalCta.astro
│   │   ├── sections/Contact.astro
│   │   └── ui/{Button,SectionHeading,PictureFrame}.astro
│   ├── config/site.ts
│   ├── data/content.ts
│   ├── layouts/BaseLayout.astro
│   ├── pages/index.astro
│   ├── scripts/site-interactions.ts
│   └── styles/{tokens,global,components,motion}.css
├── tests/
│   ├── unit/whatsapp.test.ts
│   └── e2e/desktop.spec.ts
└── docs/release-checklist.md
```

`src/data/content.ts` contém toda a copy e as coleções repetidas. Os componentes não duplicam texto. `src/config/site.ts` contém dados operacionais e o gerador da URL do WhatsApp. `tokens.css` contém valores estáveis; `components.css` contém a composição desktop; `motion.css` concentra transições e redução de movimento.

---

### Task 1: Scaffold Astro and the desktop verification harness

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro`
- Create: `playwright.config.ts`
- Create: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Produces: comando `npm run dev`, build estático em `dist/`, comando `npm run test:e2e`.
- Consumes: nenhum arquivo de aplicação existente; a pasta ainda não possui codebase frontend.

- [ ] **Step 1: Create the package manifest**

```json
{
  "name": "site-dra-maisa",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "astro check"
  },
  "dependencies": {
    "@fontsource/manrope": "^5.2.5",
    "@fontsource/newsreader": "^5.2.5",
    "astro": "^5.13.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@playwright/test": "^1.55.0",
    "typescript": "^5.9.0",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Configure static output and strict TypeScript**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'auto' },
});
```

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": { "noUncheckedIndexedAccess": true }
}
```

- [ ] **Step 3: Add the first failing desktop shell test**

```ts
// tests/e2e/desktop.spec.ts
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('renders the desktop page without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBe(sizes.viewport);
});
```

- [ ] **Step 4: Configure Playwright and make the shell test pass**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4321' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', port: 4321, reuseExistingServer: true },
});
```

```astro
---
// src/pages/index.astro
---
<html lang="pt-BR"><body><main id="conteudo"></main></body></html>
```

- [ ] **Step 5: Install, verify, and commit**

Run: `npm install && npx playwright install chromium && npm run check && npm run test:e2e`

Expected: typecheck sem erros e um teste Playwright aprovado.

Commit: `chore: scaffold desktop marketing site`

---

### Task 2: Establish design tokens, fonts, layout, and reusable primitives

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/styles/components.css`
- Create: `src/styles/motion.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/ui/Button.astro`
- Create: `src/components/ui/SectionHeading.astro`
- Create: `src/components/ui/PictureFrame.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `.container`, `.section`, `.button`, `.section-heading`, `Button`, `SectionHeading`, `PictureFrame`.
- `PictureFrame` props: `{ src?: string; alt: string; width: number; height: number; eager?: boolean; class?: string }`.
- `Button` props: `{ href: string; label: string; variant?: 'peach' | 'navy'; external?: boolean }`.

- [ ] **Step 1: Define the exact brand tokens**

```css
/* src/styles/tokens.css */
:root {
  --color-cream: #f7f2ee;
  --color-pale-blue: #e3f0f2;
  --color-navy: #30566a;
  --color-graphite: #4a4541;
  --color-olive: #8d805f;
  --color-peach: #d7a98d;
  --color-button-text: #453f3b;
  --font-display: 'Newsreader', Georgia, serif;
  --font-body: 'Manrope', Arial, sans-serif;
  --container: 1120px;
  --radius-card: 24px;
  --radius-button: 999px;
  --shadow-soft: 0 16px 40px rgb(74 69 65 / 0.10);
  --section-space: clamp(96px, 9vw, 144px);
  --ease-calm: cubic-bezier(.2, .7, .2, 1);
}
```

- [ ] **Step 2: Build the desktop base CSS**

Import `@fontsource/newsreader/600.css`, `@fontsource/manrope/400.css`, `500.css` and `600.css` in `BaseLayout.astro`. Set `box-sizing`, body colors, visible `:focus-visible`, `scroll-margin-top: 104px` on section anchors, `.container { width: min(calc(100% - 64px), var(--container)); margin-inline: auto; }` and minimum button height of `48px`.

- [ ] **Step 3: Implement primitives with accessible defaults**

`Button.astro` must add `target="_blank" rel="noopener noreferrer"` only when `external` is true. `PictureFrame.astro` must render an `<img>` when `src` exists and an empty, named design slot when the photo has not yet been approved. The empty slot must use `role="img"` and the supplied `aria-label`, not visitor-facing placeholder text.

- [ ] **Step 4: Add a primitive rendering assertion**

Extend `desktop.spec.ts` to assert that all visible `.button` elements are at least `48px` high and that the page uses `Newsreader` for `h1` and `Manrope` for body text.

- [ ] **Step 5: Run and commit**

Run: `npm run check && npm run test:e2e`

Commit: `feat: establish Maisa desktop design system`

---

### Task 3: Centralize verified content and WhatsApp behavior

**Files:**
- Create: `src/config/site.ts`
- Create: `src/data/content.ts`
- Create: `tests/unit/whatsapp.test.ts`

**Interfaces:**
- Produces: `siteConfig`, `getWhatsAppUrl(message?: string): string`, `signals`, `evaluationSteps`, `benefits`, `areas`, `faqItems`.
- `Area`: `{ slug: string; category: string; title: string; front: string; back: string }`.
- `FaqItem`: `{ question: string; answer: string }`.

- [ ] **Step 1: Write the failing URL tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl } from '../../src/config/site';

describe('buildWhatsAppUrl', () => {
  it('normalizes the phone and encodes the message', () => {
    expect(buildWhatsAppUrl('+55 (15) 99999-9999', 'Olá, Maisa!')).toBe(
      'https://wa.me/5515999999999?text=Ol%C3%A1%2C%20Maisa!',
    );
  });
  it('falls back to the contact section before a number is configured', () => {
    expect(buildWhatsAppUrl('', 'Olá')).toBe('#contato');
  });
});
```

- [ ] **Step 2: Implement deterministic WhatsApp URL generation**

```ts
export const buildWhatsAppUrl = (phone: string, message: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : '#contato';
};
```

`siteConfig.whatsappNumber` reads `PUBLIC_WHATSAPP_NUMBER ?? ''`. Do not store a guessed number in source control.

- [ ] **Step 3: Transcribe the revised Figma copy into typed arrays**

Use the current texts from the page `Revisão UX e Conversão`. Include six signals, three evaluation steps, five benefits, six areas and six FAQ answers. Copy must include the revised reassurance `Um sinal isolado não define um diagnóstico...`, the corrected lowercase after `avaliação fonoaudiológica:` and the revised CTA copy from node `114:2`.

- [ ] **Step 4: Add publication guards**

Keep `crfa`, `address`, `businessHours`, `cnpj` and `whatsappNumber` optional. Components render those fields only when non-empty. Add the factual release gates to `docs/release-checklist.md`; do not show `CRFa da profissional` or similar placeholder in the visitor interface.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run check`

Commit: `feat: centralize site content and contact configuration`

---

### Task 4: Implement sticky header and hero

**Files:**
- Create: `src/components/layout/Header.astro`
- Create: `src/components/sections/Hero.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/components.css`
- Create: `public/images/logo-maisa.png`
- Create: `public/images/hero-maisa.webp`

**Interfaces:**
- Header anchors: `#sobre`, `#avaliacao`, `#areas`, `#duvidas`, `#contato`.
- Hero uses `getWhatsAppUrl()` and exposes the page's single `h1`.

- [ ] **Step 1: Prepare production assets**

Copy `tmp/pdfs/logo-maisa-transparent.png` to `public/images/logo-maisa.png`. Convert `design-builder-5e71b5bb.png` to WebP at a maximum rendered width of `1440px`, retaining the original file as source material.

- [ ] **Step 2: Build the header**

Use the logo at the upper left, four concise navigation links and the persistent `Agendar avaliação` button. Sticky state: `position: sticky; top: 0; z-index: 50;` with translucent cream background and subtle border appearing after scroll. The header height must remain constant to avoid layout shift.

- [ ] **Step 3: Build the hero composition**

Set the hero height to `820px` at the `1440px` reference. Use the hero image as an actual `<img>` with `object-fit: cover`. Place the headline on the right half of the image with the warm earthy overlay already approved. Render:

```text
FONOAUDIOLOGIA INFANTIL • ITAPEVA–SP
Cada pequena voz merece ser ouvida.
Seu filho fala pouco, troca sons ou nem sempre é compreendido? A avaliação fonoaudiológica ajuda a entender suas necessidades e orientar os próximos passos.
Conversar pelo WhatsApp
```

Keep the image focal point configurable via `--hero-position-x`; default to the Figma crop.

- [ ] **Step 4: Extend E2E coverage**

Assert exactly one `h1`, visible CTA above the fold, working anchor navigation and no image-driven text. Verify the hero has no horizontal overflow at `1024`, `1440` and `1920px`.

- [ ] **Step 5: Run and commit**

Run: `npm run build && npm run test:e2e`

Commit: `feat: implement desktop header and hero`

---

### Task 5: Implement signals and professional introduction

**Files:**
- Create: `src/components/sections/Signals.astro`
- Create: `src/components/sections/About.astro`
- Create: `public/images/sinais-maisa.webp`
- Create: `public/images/apresentacao-maisa.webp`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/components.css`

**Interfaces:**
- `Signals` consumes `signals` and `getWhatsAppUrl()`.
- `About` consumes `siteConfig.crfa`; the credential is conditional.

- [ ] **Step 1: Build the 65/35 signals introduction**

Desktop top row: `65%` copy and `35%` photo, separated by `64px`. Photo ratio `4:5`, rounded corners and `object-fit: cover`. Place reassurance and CTA below the copy. Below both columns, render six static cards in a `3 × 2` grid.

- [ ] **Step 2: Preserve the revised signal language**

Cards use a neutral dot or simple inline SVG marker, not numbers. Do not repeat `SINAL PERCEBIDO EM CASA` inside every card. Keep all descriptions visible; signal cards must not flip.

- [ ] **Step 3: Build the presentation section**

Use `secao-apresentacao-definitivo.png`, 4:5 crop, on one side and the approved first-person copy on the other. Correct `avaliação fonoaudiológica: uma escuta`. Add the conditional credential line and CTA below the copy.

- [ ] **Step 4: Verify the desktop grids**

At `1024`, `1280`, `1440` and `1920px`, assert six signal cards remain in three columns, no title is clipped and both portrait images preserve ratio `4:5`.

- [ ] **Step 5: Run and commit**

Run: `npm run check && npm run test:e2e`

Commit: `feat: add desktop signals and professional introduction`

---

### Task 6: Implement evaluation process and benefits

**Files:**
- Create: `src/components/sections/Evaluation.astro`
- Create: `src/components/sections/Benefits.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/components.css`

**Interfaces:**
- `Evaluation` consumes `evaluationSteps` and exposes `data-reveal-group="evaluation"`.
- `Benefits` consumes `benefits` and remains non-interactive.

- [ ] **Step 1: Build the evaluation timeline**

Render the three steps side by side, joined by a horizontal progress line. Use semantic ordered list markup. Keep step 2 exactly: `Por meio de recursos e protocolos adequados à idade e à queixa, a Dra. Maisa observa como a criança compreende, interage e se comunica.`

- [ ] **Step 2: Add the reassurance and high-intent CTA**

Render the `A criança não precisa “acertar” nada...` callout after the steps. Use `Quero agendar uma avaliação` as the section CTA and explain in microcopy that it opens WhatsApp.

- [ ] **Step 3: Build benefits as readable rows/cards**

Render five items using the revised Figma wording. Benefits enter once on scroll but never flip or require a click. Use heading text size `20px` minimum and copy `16px` minimum in code, correcting the small Figma labels where necessary for web readability.

- [ ] **Step 4: Verify semantics and geometry**

Assert the evaluation steps are an `<ol>` of length three, the benefits collection has five visible entries, and all text is present before JavaScript executes.

- [ ] **Step 5: Run and commit**

Run: `npm run check && npm run test:e2e`

Commit: `feat: implement evaluation journey and benefits`

---

### Task 7: Implement accessible area flip cards

**Files:**
- Create: `src/components/sections/Areas.astro`
- Modify: `src/scripts/site-interactions.ts`
- Modify: `src/styles/components.css`
- Modify: `src/styles/motion.css`
- Modify: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Markup hook: `[data-flip-card]`, `.card-front`, `.card-back`, `.card-toggle`.
- `data-area` stores the readable area title for the accessible button label.

- [ ] **Step 1: Render both faces in the server HTML**

Use a `3 × 2` grid. Front: category, plain-language title and short summary. Back: two or three lines explaining what the evaluation observes. Each card has one native `<button type="button">` with `aria-expanded="false"` and an area-specific `aria-label`.

- [ ] **Step 2: Write the interaction state function**

```ts
const setCardExpanded = (card: HTMLElement, expanded: boolean) => {
  const front = card.querySelector<HTMLElement>('.card-front')!;
  const back = card.querySelector<HTMLElement>('.card-back')!;
  const button = card.querySelector<HTMLButtonElement>('.card-toggle')!;
  card.classList.toggle('is-flipped', expanded);
  button.setAttribute('aria-expanded', String(expanded));
  front.inert = expanded;
  back.inert = !expanded;
  front.setAttribute('aria-hidden', String(expanded));
  back.setAttribute('aria-hidden', String(!expanded));
};
```

Button click toggles. Escape closes the open card and returns focus to its button. Do not implement auto-flip or hover-only activation.

- [ ] **Step 3: Implement the visual flip**

Use `perspective: 1200px`, `transform-style: preserve-3d`, `backface-visibility: hidden` and `transition: transform 560ms var(--ease-calm)`. In reduced-motion mode, remove rotation and switch opacity/content immediately.

- [ ] **Step 4: Test keyboard and reduced motion**

Playwright must activate a card with Enter, confirm `aria-expanded="true"`, press Escape, confirm it closes, and verify the back face is not exposed to accessibility APIs while closed. Emulate reduced motion and confirm the state still changes.

- [ ] **Step 5: Run and commit**

Run: `npm run test:e2e`

Commit: `feat: add accessible area card interactions`

---

### Task 8: Implement complete FAQ before the final conversion section

**Files:**
- Create: `src/components/sections/Faq.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/scripts/site-interactions.ts`
- Modify: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Section anchor: `id="duvidas"`.
- Native controls: `<details name="faq">` and `<summary>`.

- [ ] **Step 1: Render all six answers in HTML**

Use the six revised questions and answers from the Figma page. Only the first item starts open. Do not inject answers after click; this preserves SEO, no-JS access and screen-reader behavior.

- [ ] **Step 2: Add optional exclusivity fallback**

Modern browsers use the shared `name="faq"`. JavaScript listens to `toggle` and closes sibling details for browsers without details grouping.

- [ ] **Step 3: Match the Figma desktop composition**

Place heading and closing CTA in the left column; accordion in the wider right column. Keep plus/minus as visual state indicators with `aria-hidden="true"`; the summary text is the accessible name.

- [ ] **Step 4: Test the full content and keyboard flow**

Assert six summaries, six answers in the DOM, at most one open item, Space/Enter activation and a visible focus ring.

- [ ] **Step 5: Run and commit**

Run: `npm run check && npm run test:e2e`

Commit: `feat: add complete desktop FAQ`

---

### Task 9: Implement Figma node 114:2 as section 8

**Files:**
- Create: `src/components/sections/FinalCta.astro`
- Create: `public/images/conversao-maisa.webp`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/components.css`
- Modify: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Section id: `conversar`.
- Mandatory design reference: [node 114:2](https://www.figma.com/design/QSGppkOvBuYHgzfzvUeDJP?node-id=114-2).
- `PictureFrame` rendered with `width={350}` and `height={438}`.

- [ ] **Step 1: Build the exact two-column structure**

At `1440px`, position the content block at the left inside the `1120px` container and the portrait slot at the right. Use `grid-template-columns: minmax(0, 1fr) 350px; gap: 90px; align-items: center;`. Preserve section height near `780px` and the Figma breathing room.

- [ ] **Step 2: Use the revised copy verbatim**

```text
VOCÊ NÃO PRECISA TER TODAS AS RESPOSTAS
Você não precisa ter todas as respostas para dar o primeiro passo.
Pelo WhatsApp, você pode contar sua dúvida, conhecer o atendimento e consultar os horários disponíveis para avaliação.
Conversar pelo WhatsApp
Atendimento infantil em Itapeva–SP • Contato pelo WhatsApp
```

- [ ] **Step 3: Implement the photo slot**

Use a `350 × 438px` portrait frame with `border-radius: 26px`, pale-blue fallback and a subtle peach border. If `public/images/conversao-maisa.webp` does not yet contain an approved photo, render the accessible empty `PictureFrame`; do not reuse decorative rings or `OUVIR / COMPREENDER / EXPRESSAR` in this space.

- [ ] **Step 4: Add exact geometry checks**

At a `1440px` viewport, test that the photo ratio is within `0.01` of `4/5`, its left edge is to the right of the content block, and the two rectangles do not overlap. At `1024px`, keep two columns by reducing the image width proportionally to `300px` while preserving `4:5`.

- [ ] **Step 5: Run and commit**

Run: `npm run test:e2e`

Commit: `feat: implement revised desktop conversion section`

---

### Task 10: Implement practical contact and institutional footer

**Files:**
- Create: `src/components/sections/Contact.astro`
- Create: `src/components/layout/Footer.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/components.css`

**Interfaces:**
- Contact anchor: `id="contato"`.
- Conditional fields: `siteConfig.address`, `siteConfig.businessHours`, `siteConfig.crfa`, `siteConfig.cnpj`.

- [ ] **Step 1: Build the contact block**

Use the revised promise-safe copy: `Pelo WhatsApp, você pode contar sua dúvida, conhecer o atendimento e consultar os horários disponíveis para avaliação.` Show WhatsApp, `@fonomaisapalma` and `Fonoaudiologia infantil em Itapeva–SP`. Do not state that Maisa personally answers unless confirmed.

- [ ] **Step 2: Build the footer**

Render logo, specialization/city, navigation anchors, WhatsApp, Instagram and copyright. Render privacy link only when the target page exists. Render CRFa/CNPJ only when the values are confirmed.

- [ ] **Step 3: Verify every navigation target**

Playwright iterates through header and footer fragment links, verifies that each id exists exactly once and that sticky-header offset leaves the target heading visible.

- [ ] **Step 4: Run and commit**

Run: `npm run check && npm run test:e2e`

Commit: `feat: add desktop contact and footer`

---

### Task 11: Add calm, progressive motion across the page

**Files:**
- Modify: `src/scripts/site-interactions.ts`
- Modify: `src/styles/motion.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Reveal hook: `[data-reveal]`.
- CSS states: `.reveal-pending`, `.is-visible`.
- Reduced-motion behavior: all content remains opaque and static.

- [ ] **Step 1: Add one-shot IntersectionObserver reveals**

Threshold `0.12`; translate from `12px` to `0`; duration `460ms`; stagger only siblings in evaluation, benefits and areas by `75ms`, limited to each row of three.

- [ ] **Step 2: Guard against invisible content**

Elements are fully visible by default. JavaScript adds `.reveal-pending` only after observer support is confirmed. On observer callback, remove pending state, add visible state and unobserve.

- [ ] **Step 3: Add button and header feedback**

Buttons may translate `-2px` on hover and return on release. Keep focus visible. Header gains its border/shadow after `window.scrollY > 24`. Do not animate the hero headline word by word.

- [ ] **Step 4: Test no-JS and reduced-motion paths**

Disable JavaScript and assert headings/cards/CTAs remain visible. Emulate `prefers-reduced-motion: reduce` and assert computed transition durations are `0s` or effectively instant.

- [ ] **Step 5: Run and commit**

Run: `npm run test:e2e`

Commit: `feat: add calm progressive motion`

---

### Task 12: Complete SEO, structured data, analytics-ready events, and image performance

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/config/site.ts`
- Modify: `src/components/ui/Button.astro`
- Create: `src/components/Seo.astro`
- Create: `public/favicon.svg`
- Modify: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Title: `Fonoaudióloga infantil em Itapeva | Maisa Palma`.
- Meta description: `Seu filho fala pouco ou é difícil compreendê-lo? Conheça o atendimento infantil da fonoaudióloga Maisa Palma, em Itapeva. Converse pelo WhatsApp.`
- CTA event name: `whatsapp_click`; properties: `cta_location`, `cta_label`.

- [ ] **Step 1: Add canonical metadata and social tags**

Render title, description, canonical URL from `PUBLIC_SITE_URL`, Open Graph/Twitter fields, favicon and `theme-color: #F7F2EE`. Omit canonical and OG URL until the production URL is configured; never output malformed empty URLs.

- [ ] **Step 2: Add valid JSON-LD from confirmed fields**

Use `Person` for Maisa and `ProfessionalService` for the practice. Build the object conditionally; omit telephone, street address and professional identifier until confirmed. Include `sameAs` for the Instagram profile.

- [ ] **Step 3: Make conversion events analytics-ready without coupling a vendor**

On CTA activation, dispatch:

```ts
window.dispatchEvent(new CustomEvent('whatsapp_click', {
  detail: { cta_location: location, cta_label: label },
}));
```

Do not install Google Analytics or Meta Pixel in this task. The event contract permits later integration without editing each CTA.

- [ ] **Step 4: Optimize images**

Hero is eager with `fetchpriority="high"`; all below-fold images use `loading="lazy"` and explicit dimensions. Produce WebP at appropriate desktop sizes and ensure no delivered image is larger than twice its maximum CSS display width.

- [ ] **Step 5: Test metadata and commit**

Assert title, description, one H1, structured-data JSON parseability, image dimensions and accessible alt text.

Run: `npm run build && npm run test:e2e`

Commit: `feat: add SEO and conversion instrumentation contract`

---

### Task 13: Perform final desktop fidelity and release review

**Files:**
- Modify as needed: `src/styles/components.css`
- Modify: `tests/e2e/desktop.spec.ts`
- Modify: `docs/release-checklist.md`

**Interfaces:**
- Produces: desktop implementation ready for visual approval and later mobile work.

- [ ] **Step 1: Run the viewport matrix**

Capture full-page screenshots at `1024 × 900`, `1280 × 900`, `1366 × 900`, `1440 × 900` and `1920 × 1080`. Compare section by section with the `Revisão UX e Conversão` Figma frames. Give node `114:2` priority in the section 8 comparison.

- [ ] **Step 2: Check visual invariants**

Verify: correct logo; hero crop and earthy overlay; Newsreader/Manrope; 3 × 2 signal grid; 4:5 photography; three evaluation steps; 3 × 2 areas; FAQ before conversion; section 8 photo on the right; compact contact; no overlap, truncation or horizontal scrollbar.

- [ ] **Step 3: Check interaction and accessibility invariants**

Keyboard through every interactive element in DOM order. Verify visible focus, flip-card state announcements, native FAQ behavior, Escape behavior, external-link safety and reduced-motion support. Run an automated accessibility scan if the execution environment already provides one; do not add a heavy runtime dependency to the website.

- [ ] **Step 4: Run production checks**

Run: `npm test && npm run check && npm run build && npm run test:e2e`

Expected: all commands pass, no console errors, no failed requests and all internal anchors resolve.

- [ ] **Step 5: Run Lighthouse against the production preview**

Run `npm run preview -- --host 127.0.0.1`, audit at `1440px`, and record results in `docs/release-checklist.md`. Required: Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95.

- [ ] **Step 6: Resolve factual publication gates**

Record explicit status for WhatsApp number, CRFa, areas of atuação, person who answers WhatsApp, address, hours, CNPJ and privacy-policy URL. The desktop can be visually approved with missing optional data, but it cannot be published as conversion-ready until the WhatsApp number is supplied.

- [ ] **Step 7: Commit the approved desktop baseline**

Commit: `feat: complete approved desktop frontend`

Tag the final desktop review point in the handoff notes so future mobile work starts from this exact commit.

---

## Required Page Assembly Order

```astro
<BaseLayout>
  <Header />
  <main id="conteudo">
    <Hero />
    <Signals />
    <About />
    <Evaluation />
    <Benefits />
    <Areas />
    <Faq />
    <FinalCta />
    <Contact />
  </main>
  <Footer />
</BaseLayout>
```

This order is binding for the desktop implementation. It reflects the revised Figma journey: recognition of the concern, trust in the professional, understanding of the process, scope of care, removal of doubts and then a direct WhatsApp decision.

## Self-Review Results

- Scope coverage: all ten desktop frames from the revised Figma page are assigned to Tasks 4–10; motion, SEO, accessibility and desktop QA are assigned to Tasks 11–13.
- Mobile exclusion: no mobile component, menu or breakpoint is included. The code boundaries preserve a future responsive layer.
- Source consistency: section 8 explicitly binds to node `114:2`, including its current copy and `350 × 438px` right-side photo slot.
- Unknown facts: no phone, address, CRFa, CNPJ or schedule was invented. Conditional rendering and release gates are specified.
- Interaction consistency: signal/benefit cards remain readable; only area cards flip; FAQ uses native details; all effects have reduced-motion behavior.
- Placeholder scan: remaining missing business facts are modeled as optional production inputs with defined fallback behavior, not visitor-facing placeholder strings.

