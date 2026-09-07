/* Local interaction preview. No tracking, dependencies, or outgoing contact links. */
(() => {
  'use strict';

  const root = document.documentElement;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('.motion-toggle');
  let manualReduction = false;

  const updateMotionPreference = () => {
    const reduce = manualReduction || motionPreference.matches;
    root.classList.toggle('motion-reduced', reduce);
    motionToggle.setAttribute('aria-pressed', String(reduce));
    motionToggle.textContent = motionPreference.matches
      ? 'Movimento reduzido pelo sistema'
      : reduce ? 'Restaurar movimento' : 'Reduzir movimento';
    // A local preview control must never override the visitor's OS preference.
    motionToggle.disabled = motionPreference.matches;
  };
  motionToggle.hidden = false;
  motionToggle.addEventListener('click', () => {
    manualReduction = !manualReduction;
    updateMotionPreference();
  });
  motionPreference.addEventListener('change', updateMotionPreference);
  updateMotionPreference();

  document.querySelectorAll('[data-flip-card]').forEach((card) => {
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    const button = card.querySelector('.card-toggle');
    let expanded = false;

    const setExpanded = (next) => {
      expanded = next;
      card.classList.toggle('is-flipped', expanded);
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', `${expanded ? 'Voltar ao resumo' : 'Conhecer o cuidado'}: ${button.dataset.area}`);
      button.firstElementChild.textContent = expanded ? 'Voltar ao resumo' : 'Conhecer o cuidado';
      front.setAttribute('aria-hidden', String(expanded));
      back.setAttribute('aria-hidden', String(!expanded));
      front.inert = expanded;
      back.inert = !expanded;
    };

    setExpanded(false);
    card.classList.add('is-enhanced');
    button.hidden = false;
    // Native button activation handles mouse, touch, Enter and Space.
    button.addEventListener('click', () => setExpanded(!expanded));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && expanded) {
        event.preventDefault();
        setExpanded(false);
        button.focus({ preventScroll: true });
      }
    });
  });
  document.querySelector('.interaction-hint').hidden = false;

  // Content remains fully opaque even if an observer never fires.
  // Reveals run once; scroll remains native and freely reversible.
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach((element) => {
      const group = element.parentElement;
      if (group.matches('.steps, .area-grid')) {
        const position = Array.from(group.children).indexOf(element);
        const columns = group.matches('.area-grid') && window.matchMedia('(max-width: 950px)').matches ? 2 : 3;
        element.style.setProperty('--reveal-delay', `${(position % columns) * 75}ms`);
      }
      element.classList.add('reveal-active', 'reveal-pending');
      observer.observe(element);
    });
  }

  // Native <details> keeps keyboard support and a no-JavaScript fallback.
  // The name attribute handles exclusivity in current browsers, with this
  // fallback for older browsers that do not implement details groups.
  const questions = [...document.querySelectorAll('.faq details')];
  questions.forEach((question) => {
    question.addEventListener('toggle', () => {
      if (!question.open) return;
      questions.forEach((other) => { if (other !== question) other.open = false; });
    });
  });

  const notice = document.querySelector('.preview-notice');
  let lastContactButton;
  document.querySelectorAll('[data-preview-contact]').forEach((button) => {
    button.addEventListener('click', () => {
      lastContactButton = button;
      notice.hidden = false;
    });
  });
  const closeNotice = () => {
    notice.hidden = true;
    lastContactButton?.focus({ preventScroll: true });
  };
  notice.querySelector('button').addEventListener('click', closeNotice);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !notice.hidden) closeNotice();
  });
})();
