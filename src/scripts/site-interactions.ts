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
