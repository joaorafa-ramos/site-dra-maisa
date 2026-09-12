# CTA com movimento de rolagem + cards de áreas no estilo referência — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Dar à seção de CTA `#contato` a sensação de movimento ligado à rolagem observada na seção final de https://www.gracielefono.com.br/ e (2) substituir os flip cards de `#areas` por cards com a estética, o formato e o motion da seção "Condições tratadas pela Dra. Dalila" de https://www.dradalilamota.com.br/ — sem alterar copy, paleta ou tipografia.

**Architecture:** Astro 5 estático, CSS nativo e TypeScript sem dependências novas. O movimento do CTA é uma camada progressiva: scroll-linked via `requestAnimationFrame` + `IntersectionObserver` que escreve variáveis CSS (`--cta-progress`) consumidas em `components.css`/`motion.css`; a entrada única já existente em `cta-motion.ts` é preservada. Os cards de áreas viram markup estático (ícone, categoria, título, resumo, botão "Saiba mais" que expande o texto "Na avaliação" inline), com entrada escalonada por `IntersectionObserver` e hover em CSS puro. Todo conteúdo permanece no HTML servido e legível sem JavaScript.

**Tech Stack:** Astro 5, TypeScript estrito, CSS nativo, Figtree local, Vitest (unit) e Playwright (e2e) já configurados.

**Spec:** Pedido do usuário em 11/09/2026 (duas alterações) + observações das referências registradas abaixo neste documento. Documentos de apoio: `docs/superpowers/plans/2026-09-11-cta-faq-localizacoes-navegacao.md` (estado atual do CTA), `docs/revisao-2026-09-06/revisao-completa.md` (regras de acessibilidade e motion do projeto).

## Global Constraints

- **NÃO alterar copy.** Todos os textos de `src/data/content.ts` (inclusive `areas[].category`, `title`, `front`, `back`, `content.contact.*`) e os rótulos "Saiba mais" / "Voltar" / "NA AVALIAÇÃO" permanecem idênticos.
- **NÃO alterar paleta.** Usar somente os tokens de `src/styles/tokens.css`: creme `#f7f2ee`, azul-claro `#e3f0f2`, azul-marinho `#30566a`, grafite `#4a4541`, oliva `#8d805f`, pêssego `#d7a98d`, texto de botão `#453f3b`. Cores das referências (rosa, stone, roxo `#6070a6`, vinho `#883058`) **não** entram no projeto; usar apenas variações de opacidade dos tokens.
- **NÃO alterar tipografia.** Figtree, pesos 400/500/600, tamanhos atuais das classes `.section-heading`, `.section-eyebrow`, `.section-description`, `.area-card h3`, `.area-card p`, `.card-toggle`. Testes exigem `h3 ≥ 20px` e `p ≥ 16px` nas áreas.
- Escopo restrito a `#contato` (motion) e `#areas` (cards). Não tocar Hero, Sinais, Sobre, Avaliação, FAQ, Localizações, Header, Footer.
- Sem novas dependências (`package.json` intocado). Sem GSAP, framer-motion ou Tailwind.
- `prefers-reduced-motion: reduce` desliga todo movimento ligado à rolagem e toda entrada; conteúdo fica estático e visível.
- Sem JavaScript, tudo continua visível e legível: painel do CTA, os seis cards, texto da frente e do verso.
- Manter contrato existente: `data-cta`, `data-cta-step`, classes `cta-pending`/`cta-animate`, `.contact__glow[aria-hidden]`, `data-reveal-group="areas"`, `[data-flip-card]` **removido** (ver Tarefa 3), `data-area`, evento `whatsapp_click`, `whatsappLocation="areas"`.
- Viewports de verificação: 1024, 1280, 1440 e 1920 px (o site tem `min-width: 1024px`; o mobile é tratado em outra frente e não faz parte desta entrega).
- Não publicar, não fazer push, não criar repositório. Commits locais por tarefa na branch atual `codex/signals-ordered-list`.

---

## Observações das referências (evidência coletada em 11/09/2026)

### Graciele — seção final de CTA (Next.js + framer-motion, valores lidos do DOM)

Estrutura: `section` com fundo gradiente claro → camada absoluta com dois blobs desfocados (`blur(120px)` e `blur(100px)`) → camada de pontos (`radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`, `background-size: 32px 32px`, `opacity: .03`) → wrapper `max-w-4xl` → painel escuro `rounded-[32px]`, `p-16`, `text-center`, `shadow-2xl` com glows internos → ícone quadrado, `h2`, parágrafo, botões → grid de dois cards informativos abaixo.

Movimento ligado à rolagem (progresso `p` = 0 quando o topo da seção entra pela base da viewport; `p` = 0,5 quando a seção está centrada; `p` = 1 quando a base da seção sai pelo topo). Valores confirmados por amostragem:

| Camada | Propriedade | p = 0 | p = 0,5 | p = 1 |
| --- | --- | --- | --- | --- |
| Blobs de fundo | `translateY` | 0% | 15% | 30% |
| Wrapper do painel | `translateY` | +10% | 0% | −10% |
| Wrapper do painel | `scale` | 0,95 | 1,00 | 0,95 |

O mapeamento é linear e há suavização tipo mola (os valores "correm atrás" da rolagem por ~300–500 ms). Isso dá a sensação de o painel "flutuar" e crescer ao centrar-se.

Entrada única ao entrar na viewport (`whileInView`, uma vez): painel `opacity 0 → 1` + `translateY(40px → 0)`; ícone `opacity 0 → 1` + `scale(.8 → 1)`; título, parágrafo e ações `translateY(20px → 0)` em sequência; cards informativos `translateY(30px → 0)`. Hover do botão principal: seta desloca 4 px à direita.

### Dra. Dalila — "Condições tratadas pela Dra. Dalila" (HTML/CSS puro, arquivos `css/home/card-base.css`, `card-animations.css`, `utilidades/animacao-hover.css`, `js/animation.js`)

Formato do card (valores computados): largura fixa 370 px em grade centrada 3 + 3 (`gap: 25px`), `background: #fff`, `border: 1px solid` cor de borda clara, `border-radius: 14px`, `padding: 25px 20px`, `box-shadow: 0 8px 20px rgba(96,112,166,.05)`, `display: flex; flex-direction: column; align-items: center; text-align: center`, `overflow: hidden`, `position: relative`. Conteúdo: ícone 35 × 35 px (check em círculo) com `margin-bottom: 15px` → `h2` 18px/500 → `p` 14,4px com `flex-grow: 1; margin-bottom: 20px` → botão outline pill `border 1.5px`, `border-radius: 25px`, `padding: 7px 18px`, `align-self: center`. Barra superior `::before` de 4 px em gradiente, `opacity: 0`.

Hover (desktop): card `translateY(-3px)` (variável `--hover-translateY`), sombra `0 20px 30px` mais forte, borda mais escura; `::before` aparece (`opacity: 1`); ícone `scale(1.1)` com pulso suave; `h2` sobe 3 px, `p` 2 px, botão 1 px; botão preenche de fora para dentro (`::before` `width 0 → 100%`) e o texto inverte para claro; brilho diagonal (`::after` 20% de largura, `rotate(30deg)`, `translateX(300%)` em 0,7 s). Transições de 0,3–0,4 s com `cubic-bezier(0.5, 1, 0.89, 1)`.

Entrada: cada card começa `opacity: 0; translateY(20px)`; `IntersectionObserver` (`threshold: .1`, `rootMargin: 0 0 -50px 0`) adiciona `.visible`; `@keyframes fadeIn 0.6s ease-out-cubic forwards` com atraso `0.1s + índice × 0.05s`. Em telas < 768 px a animação é desligada e os cards ficam sempre visíveis.

### Tradução para a identidade Maisa (decisões de design desta entrega)

- Painel do CTA continua azul-marinho com texto creme e botão pêssego. Os blobs de fundo usam azul-claro `#e3f0f2` e pêssego a 0,35 de opacidade; os pontos usam grafite a 0,04. Nada de rosa.
- O CTA ganha as três camadas de movimento (blobs, wrapper, entrada) com os mesmos números da referência; o `.contact__glow` já existente permanece como brilho interno.
- Cards de áreas: fundo branco, `border-radius` do token (`24px`) para manter a família de cantos do site, borda `rgb(48 86 106 / .12)`, barra superior em gradiente **pêssego → azul-marinho**, ícone check-círculo em azul-marinho (SVG inline, um só para os seis cards), botão outline azul-marinho que preenche de azul-marinho no hover com texto creme. O brilho diagonal e a rotação de 360° do ícone da referência **não** entram (conflitam com a regra de "movimento discreto" do projeto); entram o levantar, a sombra, a barra superior, o scale do ícone, o preenchimento do botão e a entrada escalonada.
- O botão "Saiba mais" expande o texto do verso ("NA AVALIAÇÃO" + `back`) dentro do próprio card, abaixo do resumo, e passa a exibir "Voltar" — assim nenhuma copy é perdida e o flip desaparece.

---

## Mapa de arquivos

| Arquivo | Responsabilidade nesta entrega |
| --- | --- |
| `src/components/sections/Contact.astro` | Adicionar camada de fundo (`.contact__backdrop` com blobs e pontos) e hooks `data-cta-scroll`, `data-cta-panel` |
| `src/scripts/cta-motion.ts` | Manter entrada única; acrescentar motor scroll-linked com suavização que escreve `--cta-progress` |
| `src/styles/components.css` | Estilos do backdrop; transforms derivados de `--cta-progress`; novo visual dos cards de áreas |
| `src/styles/motion.css` | Keyframes de entrada dos cards, transições de hover, regras de movimento reduzido |
| `src/components/sections/Areas.astro` | Novo markup dos cards (ícone, categoria, título, resumo, verso expansível, botão) |
| `src/scripts/site-interactions.ts` | Trocar lógica de flip por expandir/recolher inline + observer de entrada escalonada |
| `tests/e2e/desktop.spec.ts` | Substituir testes de flip; adicionar testes de motion do CTA e de entrada dos cards |
| `tests/e2e/evaluation-benefits.spec.ts` | Ajustar seletores de geometria dos cards (`.card-front` → novos seletores) |
| `docs/release-checklist.md` | Atualizar apenas os itens de verificação afetados (flip → cards expansíveis) |

---

### Tarefa 1: Motion do CTA ligado à rolagem (estrutura + CSS)

**Files:**
- Modify: `src/components/sections/Contact.astro`
- Modify: `src/styles/components.css` (bloco `.contact*`)
- Modify: `src/styles/motion.css`
- Test: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Produces: `section#contato[data-cta-scroll]` expõe a variável CSS `--cta-progress` (número 0–1, padrão `0.5`) definida no próprio `section`. `.contact__backdrop[aria-hidden="true"]` contém `.contact__blob--blue`, `.contact__blob--peach`, `.contact__dots`. `.contact__layout[data-cta]` continua sendo o wrapper animado.
- Consumes: `content.contact.*`, `getWhatsAppUrl()`, classes existentes `.contact__panel`, `.contact__glow`, `[data-cta-step]`.

- [ ] **Step 1: Escrever o teste que falha (estrutura e transform derivado do progresso)**

Adicionar ao final de `tests/e2e/desktop.spec.ts`:

```ts
// Catches a static CTA: the panel must translate/scale with scroll progress and the backdrop must parallax.
test('contact CTA moves with scroll progress and settles centered at full scale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const section = page.locator('section#contato');
  const layout = section.locator('.contact__layout[data-cta]');
  await expect(section).toHaveAttribute('data-cta-scroll', '');
  await expect(section.locator('.contact__backdrop[aria-hidden="true"]')).toHaveCount(1);
  await expect(section.locator('.contact__blob--blue')).toHaveCount(1);
  await expect(section.locator('.contact__blob--peach')).toHaveCount(1);
  await expect(section.locator('.contact__dots')).toHaveCount(1);

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
  await expect.poll(async () => parseFloat((await readMatrix()).replace('matrix(', '').split(',')[0]!), { timeout: 3000 }).toBeGreaterThan(0.99);

  const blobTransform = await section.locator('.contact__backdrop').evaluate(element => getComputedStyle(element).transform);
  expect(blobTransform).not.toBe('none');
});

test('contact CTA motion is inert with reduced motion and without JavaScript', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('/');
  const layout = reducedPage.locator('section#contato .contact__layout[data-cta]');
  await layout.scrollIntoViewIfNeeded();
  await expect(layout).toHaveCSS('transform', 'none');
  await expect(reducedPage.locator('section#contato .contact__backdrop')).toHaveCSS('transform', 'none');
  await expect(reducedPage.locator('section#contato .section-heading')).toHaveCSS('opacity', '1');
  await reduced.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto('/');
  const panel = noJsPage.locator('section#contato .contact__panel');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toBeVisible();
  await expect(noJsPage.locator('section#contato .section-heading')).toHaveCSS('opacity', '1');
  await expect(noJsPage.locator('section#contato').getByRole('link', { name: 'Conversar pelo WhatsApp', exact: true })).toBeVisible();
  await noJs.close();
});
```

- [ ] **Step 2: Rodar o teste e confirmar a falha esperada**

Run: `npx playwright test tests/e2e/desktop.spec.ts -g "contact CTA moves|contact CTA motion" --reporter=line`
Expected: FAIL em `toHaveAttribute('data-cta-scroll')` (atributo ainda não existe).

- [ ] **Step 3: Adicionar a camada de fundo e os hooks em `Contact.astro`**

Substituir a abertura da seção e o wrapper por:

```astro
<section class="section contact" id="contato" aria-labelledby="contact-title" data-cta-scroll>
  <div class="contact__backdrop" aria-hidden="true">
    <span class="contact__blob contact__blob--blue"></span>
    <span class="contact__blob contact__blob--peach"></span>
    <span class="contact__dots"></span>
  </div>
  <div class="container contact__layout" data-cta>
    <div class="contact__panel" data-cta-panel>
```

O restante do painel (glow, copy, steps, botão, `contact__details`) permanece como está. Adicionar ao `.section-eyebrow` do painel o passo `data-cta-step` já existente — nada muda ali.

- [ ] **Step 4: Estilos do backdrop e transforms por progresso em `components.css`**

Substituir o bloco `.contact { background: var(--color-cream); }` por:

```css
.contact {
  --cta-progress: 0.5;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--color-cream);
}

.contact__backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* Parallax dos blobs: 0% → 30% conforme --cta-progress (0 → 1). */
  transform: translateY(calc(var(--cta-progress) * 30%));
}

.contact__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
}

.contact__blob--blue {
  top: -12%;
  left: 30%;
  width: 600px;
  height: 600px;
  background: rgb(227 240 242 / 0.9);
}

.contact__blob--peach {
  right: 18%;
  bottom: -14%;
  width: 500px;
  height: 500px;
  background: rgb(215 169 141 / 0.35);
}

.contact__dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 2px 2px, rgb(74 69 65 / 0.4) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.1;
}

.contact__layout {
  max-width: 980px;
  /* translateY: +10% → 0 → −10%; scale: 0.95 → 1 → 0.95 (pico no centro). */
  --cta-centered: calc(1 - abs(var(--cta-progress) - 0.5) * 2);
  transform:
    translateY(calc((0.5 - var(--cta-progress)) * 20%))
    scale(calc(0.95 + 0.05 * var(--cta-centered)));
  transform-origin: center;
  will-change: transform;
}
```

Observação: `abs()` em CSS tem suporte em Chromium ≥ 125, Safari ≥ 15.4 e Firefox ≥ 118. Como fallback para navegadores sem `abs()`, o script da Tarefa 2 também escreve `--cta-centered` diretamente; manter as duas fontes (CSS calcula, JS sobrescreve). Assim o teste passa em Chromium e o comportamento é idêntico onde `abs()` não existe.

- [ ] **Step 5: Regras de movimento reduzido em `motion.css`**

Dentro do bloco `@media (prefers-reduced-motion: reduce)` existente, acrescentar à lista de `transform: none !important;`:

```css
  .contact__layout,
  .contact__backdrop {
    transform: none !important;
  }
```

- [ ] **Step 6: Rodar o teste — parte estrutural passa, parte de progresso ainda falha**

Run: `npx playwright test tests/e2e/desktop.spec.ts -g "contact CTA moves" --reporter=line`
Expected: FAIL em `toBeLessThan(0.15)` do progresso (variável ainda fixa em 0.5). O teste de reduced motion/no-JS deve PASSAR.

- [ ] **Step 7: Commit parcial**

```bash
git add src/components/sections/Contact.astro src/styles/components.css src/styles/motion.css tests/e2e/desktop.spec.ts
git commit -m "feat: add scroll-linked backdrop and transforms to contact CTA"
```

---

### Tarefa 2: Motor de progresso com suavização em `cta-motion.ts`

**Files:**
- Modify: `src/scripts/cta-motion.ts`
- Test: `tests/e2e/desktop.spec.ts` (teste da Tarefa 1)

**Interfaces:**
- Consumes: `section#contato[data-cta-scroll]`, `[data-cta]`, `[data-cta-panel]`.
- Produces: escreve `--cta-progress` (0–1) e `--cta-centered` (0–1) no `section` a cada frame enquanto a seção estiver próxima da viewport. Expõe `data-cta-scroll="active"` enquanto o loop roda (útil para debug/teste).

- [ ] **Step 1: Reescrever `cta-motion.ts` mantendo a entrada única**

```ts
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cta = document.querySelector<HTMLElement>('[data-cta]');
const section = document.querySelector<HTMLElement>('[data-cta-scroll]');

// 1) Entrada única (comportamento existente, inalterado).
if (cta && !reducedMotion.matches && 'IntersectionObserver' in window) {
  cta.classList.add('cta-pending');
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      cta.classList.remove('cta-pending');
      cta.classList.add('cta-animate');
      observer.unobserve(cta);
    },
    { threshold: 0.12 },
  );
  observer.observe(cta);
}

// 2) Movimento ligado à rolagem com suavização (referência: painel flutua e cresce ao centrar).
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

const rawProgress = (element: HTMLElement) => {
  const box = element.getBoundingClientRect();
  const viewport = window.innerHeight;
  // 0 = topo da seção entra pela base da viewport; 1 = base da seção sai pelo topo.
  return clamp01((viewport - box.top) / (viewport + box.height));
};

if (section && cta && !reducedMotion.matches && 'IntersectionObserver' in window) {
  let target = rawProgress(section);
  let current = target;
  let running = false;
  let frame = 0;

  const write = (value: number) => {
    section.style.setProperty('--cta-progress', value.toFixed(4));
    section.style.setProperty('--cta-centered', (1 - Math.abs(value - 0.5) * 2).toFixed(4));
  };

  const tick = () => {
    target = rawProgress(section);
    current = lerp(current, target, 0.12); // ~300–500 ms de "atraso de mola"
    if (Math.abs(current - target) < 0.0005) current = target;
    write(current);
    if (running) frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    section.dataset.ctaScroll = 'active';
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    section.dataset.ctaScroll = '';
    cancelAnimationFrame(frame);
  };

  write(current);

  // Só gasta frames enquanto a seção está a até uma viewport de distância.
  const nearby = new IntersectionObserver(
    ([entry]) => (entry?.isIntersecting ? start() : stop()),
    { rootMargin: '100% 0px 100% 0px', threshold: 0 },
  );
  nearby.observe(section);

  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    stop();
    section.style.removeProperty('--cta-progress');
    section.style.removeProperty('--cta-centered');
  });
}
```

- [ ] **Step 2: Rodar os testes do CTA e os testes existentes de contato**

Run: `npx playwright test tests/e2e/desktop.spec.ts -g "contact" --reporter=line`
Expected: PASS em todos (novos e existentes: "contact CTA is a centered, photo-free conversion panel…", "unified contact conversion and footer…").

- [ ] **Step 3: Conferir visualmente**

Abrir a prévia em 1440 × 900, rolar lentamente até `#contato` e verificar: painel entra ligeiramente abaixo e menor, chega ao tamanho cheio quando centrado e sobe/encolhe ao sair; blobs deslizam mais devagar que o conteúdo; sem "salto" ao entrar (o lerp suaviza). Rolar rápido para cima e para baixo: nenhum tremor, o foco do botão continua visível e clicável. Em 1024 px o painel não estoura a lateral (o `overflow: hidden` da seção corta os blobs, não o painel).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/cta-motion.ts
git commit -m "feat: drive contact CTA transforms from smoothed scroll progress"
```

---

### Tarefa 3: Cards de áreas — markup e comportamento expandir/recolher (substitui o flip)

**Files:**
- Modify: `src/components/sections/Areas.astro`
- Modify: `src/scripts/site-interactions.ts`
- Test: `tests/e2e/desktop.spec.ts`, `tests/e2e/evaluation-benefits.spec.ts`

**Interfaces:**
- Produces: `li.area-card[data-area-card][data-area="<title>"]` contendo `.area-card__icon` (SVG inline, `aria-hidden`), `.area-card__category`, `h3`, `.area-card__summary` (texto `front`), `.area-card__details#area-<slug>-details` (`hidden` só após o JS ativar; contém `.area-card__category` com "NA AVALIAÇÃO" e `p` com `back`), `button.card-toggle[aria-expanded][aria-controls]` com os spans `.card-toggle__open` ("Saiba mais") e `.card-toggle__close` ("Voltar") e a seta `↗`.
- Consumes: `areas[]` e `content.areas.*` de `content.ts`, `getWhatsAppUrl()`, `data-reveal`/`data-reveal-stagger` já usados na seção.
- Removes: `[data-flip-card]`, `.area-card__faces`, `.card-front`, `.card-back`, classe `is-flipped`, atributos `inert`/`aria-hidden` nas faces, `data-enhanced`.

- [ ] **Step 1: Substituir os testes de flip por testes do novo contrato**

Em `tests/e2e/desktop.spec.ts`, **remover** os testes: `'area cards expose only the active face and support Enter, click and Escape'`, `'area cards switch content immediately without rotation with reduced motion'` e `'area summaries and evaluation details are readable without JavaScript'`. **Adicionar** no lugar:

```ts
test('area cards expand their evaluation note inline and support Enter, click and Escape', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#areas [data-area-card]');
  await expect(cards).toHaveCount(6);
  await expect(page.locator('#areas [data-flip-card], #areas .card-front, #areas .card-back')).toHaveCount(0);
  for (const card of await cards.all()) {
    const area = (await card.getAttribute('data-area'))!;
    const button = card.getByRole('button');
    const details = card.locator('.area-card__details');
    const backCopy = (await details.locator('p').last().innerText()).trim();
    await expect(card.locator('.area-card__icon svg')).toHaveCount(1);
    await expect(card.locator('h3')).toHaveText(area);
    await expect(button).toHaveAccessibleName(`Saiba mais sobre ${area}`);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(details).toBeHidden();
    expect(await card.ariaSnapshot()).not.toContain(backCopy);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveAccessibleName(`Voltar para ${area}`);
    await expect(details).toBeVisible();
    await expect(details.getByText('NA AVALIAÇÃO', { exact: true })).toBeVisible();
    expect(await card.ariaSnapshot()).toContain(backCopy);
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    await expect(details).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await card.hover();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  }
});

test('area cards never rotate and keep both texts readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  const cards = page.locator('#areas [data-area-card]');
  await expect(cards).toHaveCount(6);
  for (const card of await cards.all()) {
    await expect(card.locator('.area-card__summary')).toBeVisible();
    await expect(card.locator('.area-card__details')).toBeVisible();
    await expect(card.locator('.area-card__details p').last()).toBeVisible();
    await expect(card.getByRole('button')).toHaveCount(0);
    await expect(card).toHaveCSS('transform', 'none');
  }
  await context.close();
});
```

Em `tests/e2e/evaluation-benefits.spec.ts`, no teste `evaluation and areas preserve readable desktop geometry`, trocar o seletor
`'#avaliacao h3, #avaliacao li p, .area-card .card-front > h3, .area-card .card-front > p:last-child'`
por
`'#avaliacao h3, #avaliacao li p, .area-card h3, .area-card .area-card__summary'`.

Em `desktop.spec.ts`, no teste `area cards keep a readable three-column two-row grid`, trocar `page.locator('#areas [data-flip-card]')` por `page.locator('#areas [data-area-card]')` e a linha que mede `.card-front` por:

```ts
expect(await card.locator('.area-card__summary').evaluate(element => element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1)).toBe(true);
```

- [ ] **Step 2: Rodar e confirmar a falha esperada**

Run: `npx playwright test -g "area cards" --reporter=line`
Expected: FAIL em `toHaveCount(6)` de `[data-area-card]`.

- [ ] **Step 3: Reescrever o `<ul>` em `Areas.astro`**

Manter frontmatter e intro. Substituir o `<ul class="areas__grid">…</ul>` por:

```astro
    <ul class="areas__grid" role="list" data-reveal-stagger>
      {areas.map(area => (
        <li class="area-card" data-area-card data-area={area.title} data-reveal>
          <span class="area-card__bar" aria-hidden="true"></span>
          <span class="area-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="m8.5 12.2 2.3 2.3 4.7-4.9" />
            </svg>
          </span>
          <p class="area-card__category">{area.category}</p>
          <h3>{area.title}</h3>
          <p class="area-card__summary">{area.front}</p>
          <div class="area-card__details" id={`area-${area.slug}-details`}>
            <p class="area-card__category">NA AVALIAÇÃO</p>
            <p>{area.back}</p>
          </div>
          <button
            class="card-toggle"
            type="button"
            aria-expanded="false"
            aria-controls={`area-${area.slug}-details`}
            aria-label={`Saiba mais sobre ${area.title}`}
            hidden
          >
            <span class="card-toggle__open">Saiba mais</span>
            <span class="card-toggle__close">Voltar</span>
            <span aria-hidden="true">↗</span>
          </button>
        </li>
      ))}
    </ul>
```

Regras: o `<h3>` do verso da versão antiga (título repetido) é removido — ele era duplicata do mesmo título, não copy própria; todo texto de `content.ts` continua presente uma vez por card. O botão nasce `hidden` e só aparece com JS (mesma estratégia atual), garantindo leitura completa sem JS.

- [ ] **Step 4: Substituir a lógica de flip em `site-interactions.ts`**

Remover `setCardExpanded` e o bloco `document.querySelectorAll('[data-flip-card]')…`. Inserir no mesmo lugar:

```ts
const setAreaExpanded = (card: HTMLElement, expanded: boolean) => {
  const details = card.querySelector<HTMLElement>('.area-card__details')!;
  const button = card.querySelector<HTMLButtonElement>('.card-toggle')!;
  card.classList.toggle('is-expanded', expanded);
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-label', `${expanded ? 'Voltar para' : 'Saiba mais sobre'} ${card.dataset.area}`);
  details.hidden = !expanded;
};

document.querySelectorAll<HTMLElement>('[data-area-card]').forEach(card => {
  const button = card.querySelector<HTMLButtonElement>('.card-toggle')!;
  button.addEventListener('click', () => {
    setAreaExpanded(card, button.getAttribute('aria-expanded') !== 'true');
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      setAreaExpanded(card, false);
      button.focus();
    }
  });
  // Sem JS o verso fica visível; com JS ele nasce recolhido e o botão aparece.
  setAreaExpanded(card, false);
  card.dataset.enhanced = 'true';
  button.hidden = false;
});
```

- [ ] **Step 5: Rodar os testes de áreas**

Run: `npx playwright test -g "area cards|evaluation and areas" --reporter=line`
Expected: PASS nos testes de comportamento; os de geometria podem ainda falhar por CSS (resolvido na Tarefa 4).

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Areas.astro src/scripts/site-interactions.ts tests/e2e/desktop.spec.ts tests/e2e/evaluation-benefits.spec.ts
git commit -m "feat: replace area flip cards with inline expandable cards"
```

---

### Tarefa 4: Cards de áreas — estética e hover no estilo referência

**Files:**
- Modify: `src/styles/components.css` (bloco `.areas*`, `.area-card*`, `.card-toggle*`)
- Modify: `src/styles/motion.css`
- Test: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Consumes: markup da Tarefa 3, tokens de `tokens.css`, `--ease-calm`.
- Produces: classes `.area-card__bar`, `.area-card__icon`, `.area-card__summary`, `.area-card__details`, estado `.is-expanded`; hover/focus-within com levantar, sombra, barra e preenchimento do botão.

- [ ] **Step 1: Escrever o teste de aparência e hover**

Adicionar em `tests/e2e/desktop.spec.ts`:

```ts
// Catches a regression back to flip visuals or a hover without the reference's lift/bar/fill response.
test('area cards use the centered reference format and lift with a top bar and filled button on hover', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const card = page.locator('#areas [data-area-card]').first();
  const bar = card.locator('.area-card__bar');
  const button = card.getByRole('button');
  await card.scrollIntoViewIfNeeded();

  await expect(card).toHaveCSS('text-align', 'center');
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(card).toHaveCSS('border-top-left-radius', '24px');
  await expect(card.locator('.area-card__icon')).toHaveCSS('color', 'rgb(48, 86, 106)');
  await expect(card.locator('h3')).toHaveCSS('font-family', /Figtree/);
  await expect(card.locator('h3')).toHaveCSS('font-size', '28px');
  await expect(card.locator('.area-card__summary')).toHaveCSS('font-size', '16px');
  await expect(bar).toHaveCSS('opacity', '0');
  await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(button).toHaveCSS('border-top-left-radius', '999px');
  const restingShadow = await card.evaluate(element => getComputedStyle(element).boxShadow);

  await card.hover();
  await expect(bar).toHaveCSS('opacity', '1');
  await expect.poll(() => card.evaluate(element => getComputedStyle(element).transform)).toMatch(/matrix\(1, 0, 0, 1, 0, -[3-6]\)/);
  await expect.poll(() => card.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe(restingShadow);
  await button.hover();
  await expect(button).toHaveCSS('background-color', 'rgb(48, 86, 106)');
  await expect(button).toHaveCSS('color', 'rgb(247, 242, 238)');
});
```

- [ ] **Step 2: Rodar e confirmar a falha esperada**

Run: `npx playwright test -g "centered reference format" --reporter=line`
Expected: FAIL em `text-align` (cards ainda alinhados à esquerda) ou em `.area-card__bar`.

- [ ] **Step 3: Substituir o CSS dos cards em `components.css`**

Remover todas as regras que começam com `.area-card__faces`, `.card-front`, `.card-back`, `.area-card[data-enhanced]`, `.is-flipped` e o `.card-toggle` antigo. Substituir o bloco `.area-card { … }` até `.areas__action .button { … }` por:

```css
.area-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  padding: 32px 28px 28px;
  overflow: hidden;
  border: 1px solid rgb(48 86 106 / 0.12);
  border-radius: var(--radius-card);
  background: #fff;
  box-shadow: 0 8px 20px rgb(48 86 106 / 0.05);
  text-align: center;
}

.area-card__bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--color-peach), var(--color-navy));
  opacity: 0;
}

.area-card__icon {
  display: grid;
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
  place-items: center;
  color: var(--color-navy);
}

.area-card__icon svg {
  width: 36px;
  height: 36px;
}

.area-card p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

.area-card .area-card__category {
  margin-bottom: 12px;
  color: var(--color-navy);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
}

.area-card h3 {
  margin: 0 0 16px;
  color: var(--color-navy);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  line-height: 1.15;
}

.area-card__summary {
  flex-grow: 1;
  margin-bottom: 24px;
}

.area-card__details {
  width: 100%;
  margin-bottom: 24px;
  padding: 20px 20px 4px;
  border-top: 1px solid rgb(48 86 106 / 0.12);
  background: #f0e1d6;
  border-radius: 16px;
}

.area-card__details .area-card__category {
  margin-bottom: 8px;
}

.area-card__details[hidden] {
  display: none;
}

.card-toggle {
  position: relative;
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  padding: 10px 22px;
  overflow: hidden;
  border: 1.5px solid var(--color-navy);
  border-radius: var(--radius-button);
  background: transparent;
  color: var(--color-navy);
  font: 600 14px / 1.5 var(--font-body);
  cursor: pointer;
  isolation: isolate;
}

/* Preenchimento da esquerda para a direita, como na referência. */
.card-toggle::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 0;
  background: var(--color-navy);
  content: '';
}

.card-toggle[hidden],
.card-toggle__close,
.is-expanded .card-toggle__open {
  display: none;
}

.is-expanded .card-toggle__close {
  display: inline;
}

.areas__action {
  margin-top: 40px;
  text-align: center;
}

.areas__action .button {
  min-height: 56px;
  padding-inline: 32px;
}
```

- [ ] **Step 4: Hover, foco e transições em `motion.css`**

Adicionar antes do bloco `@media (prefers-reduced-motion: reduce)`:

```css
/* Cards de áreas: resposta de hover inspirada na referência (levantar, barra, ícone, preenchimento). */
.area-card {
  transition: transform 300ms var(--ease-calm), box-shadow 300ms var(--ease-calm), border-color 300ms var(--ease-calm);
}

.area-card__bar {
  transition: opacity 300ms var(--ease-calm);
}

.area-card__icon,
.area-card h3,
.area-card__summary,
.card-toggle {
  transition: transform 400ms var(--ease-calm), color 300ms var(--ease-calm), background-color 300ms var(--ease-calm), border-color 300ms var(--ease-calm);
}

.card-toggle::before {
  transition: width 300ms var(--ease-calm);
}

.area-card:hover,
.area-card:focus-within {
  border-color: rgb(48 86 106 / 0.28);
  box-shadow: 0 20px 30px rgb(48 86 106 / 0.12);
  transform: translateY(-4px);
}

.area-card:hover .area-card__bar,
.area-card:focus-within .area-card__bar {
  opacity: 1;
}

.area-card:hover .area-card__icon,
.area-card:focus-within .area-card__icon {
  transform: scale(1.1);
}

.area-card:hover h3 {
  transform: translateY(-3px);
}

.area-card:hover .area-card__summary {
  transform: translateY(-2px);
}

.card-toggle:hover,
.card-toggle:focus-visible {
  color: var(--color-cream);
}

.card-toggle:hover::before,
.card-toggle:focus-visible::before {
  width: 100%;
}
```

No bloco `@media (prefers-reduced-motion: reduce)`, remover as regras antigas de `.area-card[data-enhanced] …` e acrescentar `.area-card, .area-card__icon, .area-card h3, .area-card__summary, .card-toggle` à lista de `transform: none !important;`.

- [ ] **Step 5: Rodar todos os testes de áreas e geometria**

Run: `npx playwright test -g "area|areas" --reporter=line`
Expected: PASS (comportamento, aparência, grade 3 × 2, geometria de texto). Se algum título quebrar em três linhas a 1024 px e falhar a geometria, reduzir `padding-inline` do card para 24px — não alterar tamanho de fonte.

- [ ] **Step 6: Commit**

```bash
git add src/styles/components.css src/styles/motion.css tests/e2e/desktop.spec.ts
git commit -m "feat: style area cards after the reference with lift, bar and filled button"
```

---

### Tarefa 5: Entrada escalonada dos cards (fadeIn 0,6 s + 0,05 s por card)

**Files:**
- Modify: `src/styles/motion.css`
- Modify: `src/scripts/site-interactions.ts` (nenhuma mudança de lógica; apenas confirmar que o reveal já cobre os cards)
- Test: `tests/e2e/desktop.spec.ts`

**Interfaces:**
- Consumes: `[data-reveal-stagger] > [data-reveal]` já presente em `.areas__grid`, classes `.reveal-pending`/`.is-visible` de `enableProgressiveReveals()`.
- Produces: atrasos por card de 0/50/100/150/200/250 ms (referência: 0,1 s + índice × 0,05 s; o 0,1 s inicial vem do próprio `threshold`), deslocamento de 20 px, duração 600 ms.

- [ ] **Step 1: Ajustar o teste de reveal existente**

No teste `'progressive reveals keep content visible by default and reveal area rows in short staggered groups'`, trocar a expectativa de atrasos por:

```ts
  expect(delays).toEqual(['0ms', '50ms', '100ms', '150ms', '200ms', '250ms']);
```

e trocar o seletor `#areas .area-card[data-reveal]` por `#areas [data-area-card][data-reveal]`.

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx playwright test -g "progressive reveals" --reporter=line`
Expected: FAIL (atrasos atuais `0/75/150/0/75/150`).

- [ ] **Step 3: Escalonamento por índice apenas para os cards de áreas**

Em `motion.css`, após as regras `[data-reveal-stagger] > [data-reveal]:nth-child(3n…)`, adicionar (mais específico, vence as regras genéricas):

```css
/* Áreas: atraso crescente por card, como na referência (0,05 s por card). */
.areas__grid > [data-area-card]:nth-child(1) { --reveal-delay: 0ms; }
.areas__grid > [data-area-card]:nth-child(2) { --reveal-delay: 50ms; }
.areas__grid > [data-area-card]:nth-child(3) { --reveal-delay: 100ms; }
.areas__grid > [data-area-card]:nth-child(4) { --reveal-delay: 150ms; }
.areas__grid > [data-area-card]:nth-child(5) { --reveal-delay: 200ms; }
.areas__grid > [data-area-card]:nth-child(6) { --reveal-delay: 250ms; }

.areas__grid > [data-area-card].reveal-pending {
  opacity: 0;
  transform: translateY(20px);
}

.areas__grid > [data-area-card].is-visible {
  transition: opacity 600ms cubic-bezier(0.33, 1, 0.68, 1), transform 600ms cubic-bezier(0.33, 1, 0.68, 1);
  transition-delay: var(--reveal-delay);
}
```

Atenção à cascata: `.area-card` em `motion.css` define `transition` de hover; a regra `.is-visible` acima é mais específica e prevalece só enquanto o card entra. Para o hover funcionar após a entrada, acrescentar em `site-interactions.ts`, dentro do callback do `revealObserver`, logo após `target.classList.add('is-visible')`:

```ts
      target.addEventListener('transitionend', () => target.classList.add('is-settled'), { once: true });
```

e em `motion.css`:

```css
.areas__grid > [data-area-card].is-settled {
  transition: transform 300ms var(--ease-calm), box-shadow 300ms var(--ease-calm), border-color 300ms var(--ease-calm);
  transition-delay: 0ms;
}
```

- [ ] **Step 4: Rodar reveal + reduced motion + no-JS**

Run: `npx playwright test -g "progressive reveals|reveal targets remain readable" --reporter=line`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/motion.css src/scripts/site-interactions.ts tests/e2e/desktop.spec.ts
git commit -m "feat: stagger area card entrance like the reference"
```

---

### Tarefa 6: Verificação completa e entrega

**Files:**
- Modify: `docs/release-checklist.md` (somente linhas afetadas)

- [ ] **Step 1: Rodar a bateria completa**

Run: `npm test && npm run check && npm run build && npm run test:e2e`
Expected: unit 4/4, `astro check` 0 erros, build OK, e2e todos verdes. Registrar contagens reais.

- [ ] **Step 2: Matriz visual**

Em 1024, 1280, 1440 e 1920 × 900: (a) `#areas` — seis cards centrados, ícone/categoria/título/resumo/botão alinhados, nenhum título cortado, hover levanta e mostra a barra pêssego→marinho, "Saiba mais" expande o texto "NA AVALIAÇÃO" sem quebrar a grade (os cards da mesma linha podem crescer; aceitável), Escape recolhe; (b) `#contato` — painel flutua/escala com a rolagem, blobs em parallax, entrada escalonada uma única vez, botão sempre clicável.

- [ ] **Step 3: Acessibilidade e degradação**

Teclado: Tab chega a cada "Saiba mais", Enter/Espaço alterna, Escape fecha e devolve o foco; foco visível sobre o preenchimento marinho (outline creme do `:focus-visible` global fica visível sobre fundo branco; conferir). Reduzir movimento (DevTools → Rendering → `prefers-reduced-motion: reduce`): nada se move, tudo visível. Desativar JS: seis cards com resumo e verso visíveis e sem botão; CTA estático e legível.

- [ ] **Step 4: Checklist e diff**

Em `docs/release-checklist.md`, na linha "Verificados por testes E2E: …", trocar "teclado/Escape nos cards" por "cards de áreas expansíveis com teclado/Escape, entrada escalonada e hover; CTA com movimento ligado à rolagem e inerte com movimento reduzido". Revisar `git diff feat/frontend-desktop-dra-maisa..HEAD --stat` e confirmar que apenas os arquivos do mapa foram alterados.

- [ ] **Step 5: Commit final**

```bash
git add docs/release-checklist.md
git commit -m "docs: record CTA scroll motion and area card verification"
```

---

## Self-review

- **Cobertura do pedido:** (1) motion do CTA → Tarefas 1–2 reproduzem as três camadas observadas (parallax de fundo 0→30%, wrapper +10%→−10% com scale 0,95→1→0,95 e suavização, entrada única já existente). (2) cards de áreas → Tarefa 3 (formato e comportamento sem flip), Tarefa 4 (estética e hover), Tarefa 5 (entrada escalonada). Verificação → Tarefa 6.
- **Copy/paleta/tipografia:** nenhum texto de `content.ts` é editado; rótulos "Saiba mais"/"Voltar"/"NA AVALIAÇÃO" preservados; cores somente por tokens ou opacidades deles; fontes e tamanhos inalterados (testes reforçam `h3` 28px / `p` 16px / Figtree).
- **Consistência de nomes:** `data-cta-scroll`, `--cta-progress`, `--cta-centered`, `.contact__backdrop/.contact__blob--blue/--peach/.contact__dots` iguais em CSS, script e testes; `[data-area-card]`, `.area-card__details`, `.area-card__summary`, `.area-card__bar`, `.card-toggle`, `.is-expanded`, `.is-settled` iguais em markup, CSS, script e testes.
- **Placeholders:** nenhum "TBD"; todo passo tem código ou comando.
- **Risco conhecido:** `abs()` em CSS é redundante com o `--cta-centered` escrito pelo JS — mantido de propósito como fallback bidirecional. Se `astro check` reclamar de `calc(abs(...))`, remover somente a linha `--cta-centered` do CSS e manter a do script.
