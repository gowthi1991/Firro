// WhatsApp FAB: collapses to an icon after 480px of scroll (icon-only once past the hero on mobile).
// Hidden while the demo form is on screen so it never covers the submit button, and on mobile
// while the hero's own CTAs (which include "Chat on WhatsApp") are on screen.

export function initFab(): void {
  const fab = document.querySelector<HTMLElement>('[data-fab]');
  if (!fab) return;
  const mobile = window.matchMedia('(max-width: 767px)');

  const onScroll = () => fab.classList.toggle('mini', mobile.matches || window.scrollY > 480);
  window.addEventListener('scroll', onScroll, { passive: true });
  mobile.addEventListener('change', onScroll);
  onScroll();

  if (!('IntersectionObserver' in window)) return;
  let formVisible = false;
  let ctasVisible = false;
  const update = () => {
    const away = formVisible || (mobile.matches && ctasVisible);
    fab.classList.toggle('away', away);
    if (away) fab.setAttribute('tabindex', '-1');
    else fab.removeAttribute('tabindex');
  };
  mobile.addEventListener('change', update);

  const form = document.querySelector('[data-lead-form]');
  if (form) {
    new IntersectionObserver(([e]) => {
      formVisible = !!e?.isIntersecting;
      update();
    }).observe(form);
  }
  const ctas = document.querySelector('[data-hero-ctas]');
  if (ctas) {
    new IntersectionObserver(([e]) => {
      ctasVisible = !!e?.isIntersecting;
      update();
    }).observe(ctas);
  }
}
