import {
  buildInstagramClickPayload,
  buildMapDirectionsPayload,
  buildWhatsAppClickPayload,
  pushToDataLayer,
} from './tracking';

const faqDetails = Array.from(document.querySelectorAll<HTMLDetailsElement>('details[name="faq"]'));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.addEventListener('click', event => {
  const target = event.target as Element;

  const whatsappLink = target.closest<HTMLElement>('[data-whatsapp-cta]');
  if (whatsappLink) {
    pushToDataLayer(buildWhatsAppClickPayload(whatsappLink.dataset.whatsappLocation ?? '', whatsappLink.dataset.whatsappLabel ?? ''));
    return;
  }

  const directionsLink = target.closest<HTMLElement>('[data-map-directions]');
  if (directionsLink) {
    pushToDataLayer(buildMapDirectionsPayload(directionsLink.dataset.locationId ?? ''));
    return;
  }

  const instagramLink = target.closest<HTMLElement>('[data-instagram-cta]');
  if (instagramLink) {
    pushToDataLayer(buildInstagramClickPayload());
  }
});

const enableProgressiveReveals = () => {
  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) return;

  const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  revealTargets.forEach(target => target.classList.add('reveal-pending'));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = entry.target as HTMLElement;
      target.classList.remove('reveal-pending');
      target.classList.add('is-visible');
      const settle = (event: TransitionEvent) => {
        if (event.target !== target || event.propertyName !== 'opacity') return;
        target.classList.add('is-settled');
        target.removeEventListener('transitionend', settle);
      };
      target.addEventListener('transitionend', settle);
      revealObserver.unobserve(target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });

  revealTargets.forEach(target => revealObserver.observe(target));
};

enableProgressiveReveals();

faqDetails.forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    faqDetails.forEach(sibling => {
      if (sibling !== details) sibling.open = false;
    });
  });
});

// Iris 11.b A-07: the map iframe is only requested once the visitor asks for it — "Como chegar" (a
// plain link) is the no-JS fallback, so directions still work without this script running at all.
document.querySelectorAll<HTMLButtonElement>('[data-location-map-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') return;

    const card = button.closest<HTMLElement>('[data-location-card]')!;
    const panel = card.querySelector<HTMLElement>('[data-location-map]')!;
    const embedUrl = button.dataset.embedUrl ?? '';
    const name = card.querySelector<HTMLElement>('.location-card__name')?.textContent ?? '';

    const frame = document.createElement('div');
    frame.className = 'location-card__map-frame';
    frame.innerHTML = `<iframe src="${embedUrl}" title="Localização da ${name} em Itapeva" loading="lazy" width="100%" height="300" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    panel.append(frame);
    panel.hidden = false;

    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', `Mapa da ${name} carregado`);
    button.textContent = 'Mapa carregado';
  });
});

const whatsappFloat = document.querySelector<HTMLElement>('[data-whatsapp-float]');
const hero = document.querySelector<HTMLElement>('.hero');
const contact = document.querySelector<HTMLElement>('#contato');
const footer = document.querySelector<HTMLElement>('.site-footer');

if (whatsappFloat && hero && contact && footer && 'IntersectionObserver' in window) {
  const hidden = { hero: true, end: false };

  const applyVisibility = () => {
    whatsappFloat.dataset.visible = String(!hidden.hero && !hidden.end);
  };

  const heroObserver = new IntersectionObserver(([entry]) => {
    hidden.hero = Boolean(entry?.isIntersecting);
    applyVisibility();
  });
  heroObserver.observe(hero);

  const endObserver = new IntersectionObserver(entries => {
    hidden.end = entries.some(entry => entry.isIntersecting);
    applyVisibility();
  });
  endObserver.observe(contact);
  endObserver.observe(footer);
}
