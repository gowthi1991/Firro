// WhatsApp FAB: collapses to an icon after 480px of scroll (after the hero on mobile),
// and hides while the demo form is on screen so it never covers the submit button.

export function initFab(): void {
  const fab = document.querySelector<HTMLElement>('[data-fab]');
  if (!fab) return;
  const hero = document.getElementById('top');
  const mobile = window.matchMedia('(max-width: 767px)');

  const onScroll = () => {
    const threshold = mobile.matches && hero ? hero.offsetTop + hero.offsetHeight * 0.5 : 480;
    fab.classList.toggle('mini', window.scrollY > threshold);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  mobile.addEventListener('change', onScroll);
  onScroll();

  const form = document.querySelector('[data-lead-form]');
  if (form && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([e]) => {
        const away = !!e?.isIntersecting;
        fab.classList.toggle('away', away);
        if (away) fab.setAttribute('tabindex', '-1');
        else fab.removeAttribute('tabindex');
      },
      { threshold: 0 },
    ).observe(form);
  }
}
