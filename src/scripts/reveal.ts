// Fallback for browsers without scroll-driven animations (Safari, Firefox):
// add `.in-view` once an element enters the viewport. Chromium uses `animation-timeline: view()` instead.

export function initReveal(): void {
  if (CSS.supports('animation-timeline: view()')) return;
  const els = document.querySelectorAll<HTMLElement>('.rv, .fold, .nudge');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  els.forEach((el) => io.observe(el));
}
