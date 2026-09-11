const cta = document.querySelector<HTMLElement>('[data-cta]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (cta && !reducedMotion && 'IntersectionObserver' in window) {
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
