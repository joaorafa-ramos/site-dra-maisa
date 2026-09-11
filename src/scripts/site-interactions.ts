const setCardExpanded = (card: HTMLElement, expanded: boolean) => {
  const front = card.querySelector<HTMLElement>('.card-front')!;
  const back = card.querySelector<HTMLElement>('.card-back')!;
  const button = card.querySelector<HTMLButtonElement>('.card-toggle')!;
  card.classList.toggle('is-flipped', expanded);
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-label', `${expanded ? 'Voltar para' : 'Saiba mais sobre'} ${card.dataset.area}`);
  front.inert = expanded;
  back.inert = !expanded;
  front.setAttribute('aria-hidden', String(expanded));
  back.setAttribute('aria-hidden', String(!expanded));
};

document.querySelectorAll<HTMLElement>('[data-flip-card]').forEach(card => {
  const button = card.querySelector<HTMLButtonElement>('.card-toggle')!;
  button.addEventListener('click', () => {
    setCardExpanded(card, button.getAttribute('aria-expanded') !== 'true');
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      setCardExpanded(card, false);
      button.focus();
    }
  });
  // Leave both faces readable until this card's controls are ready.
  setCardExpanded(card, false);
  card.dataset.enhanced = 'true';
  button.hidden = false;
});

const faqDetails = Array.from(document.querySelectorAll<HTMLDetailsElement>('details[name="faq"]'));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
      revealObserver.unobserve(target);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(target => revealObserver.observe(target));
};

enableProgressiveReveals();

const revealFaqAnswer = (details: HTMLDetailsElement) => {
  if (prefersReducedMotion.matches) return;

  const answer = details.querySelector<HTMLElement>('[data-faq-answer]')!;
  if (!answer.dataset.faqCharacters) {
    const walker = document.createTreeWalker(answer, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);

    textNodes.forEach(textNode => {
      const characters = Array.from(textNode.data);
      const fragment = document.createDocumentFragment();
      characters.forEach((character, index) => {
        const span = document.createElement('span');
        span.dataset.faqCharacter = '';
        span.style.setProperty('--faq-character-index', String(index));
        span.textContent = character;
        fragment.append(span);
      });
      textNode.replaceWith(fragment);
    });
    answer.dataset.faqCharacters = 'true';
  }

  answer.classList.remove('is-revealed');
  answer.classList.add('is-revealing');
  void answer.offsetWidth;
  requestAnimationFrame(() => {
    if (!details.open) return;
    answer.classList.remove('is-revealing');
    answer.classList.add('is-revealed');
  });
};

faqDetails.forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    faqDetails.forEach(sibling => {
      if (sibling !== details) sibling.open = false;
    });
    revealFaqAnswer(details);
  });
});

const signalDetails = Array.from(document.querySelectorAll<HTMLDetailsElement>('details[name="signals"]'));

signalDetails.forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    signalDetails.forEach(sibling => {
      if (sibling !== details) sibling.open = false;
    });
  });
});
