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
