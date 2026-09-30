// One-time sequences: add `.play` when each block first comes into view, then stop observing.
// Thresholds match the reference (.hseq 0.6, .nseq 0.45, .wseq 0.35).

const SEQUENCES: [selector: string, threshold: number][] = [
  ['.hseq', 0.6],
  ['.nseq', 0.45],
  ['.wseq', 0.35],
  ['[data-seq="story"]', 0.2],
];

export function initSequences(): void {
  for (const [selector, threshold] of SEQUENCES) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) continue;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('play');
      continue;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('play');
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
  }
  initVerticalTimeline();
}

/**
 * Mobile "How it works" timeline runs vertically. Card heights vary, so measure the distance
 * between the first and last node and time each card's switch-on to when the marker reaches it.
 */
function initVerticalTimeline(): void {
  const seq = document.querySelector<HTMLElement>('.hseq');
  if (!seq) return;
  const cards = [...seq.querySelectorAll<HTMLElement>('.hcard')];
  const nodes = cards.map((c) => c.querySelector<HTMLElement>('.hnode'));
  const defaults = cards.map((c) => c.style.getPropertyValue('--d'));
  const mq = window.matchMedia('(max-width: 767px)');

  const measure = () => {
    if (!mq.matches) {
      seq.style.removeProperty('--track-len');
      cards.forEach((c, i) => c.style.setProperty('--d', defaults[i] ?? ''));
      return;
    }
    const top = seq.getBoundingClientRect().top;
    const ys = nodes.map((n) => (n ? n.getBoundingClientRect().top + n.offsetHeight / 2 - top : 0));
    const first = ys[0] ?? 0;
    const len = (ys[ys.length - 1] ?? 0) - first;
    if (len <= 0) return;
    seq.style.setProperty('--track-len', `${len}px`);
    // fill runs 2700ms after a 300ms delay — same as desktop
    cards.forEach((c, i) =>
      c.style.setProperty('--d', `${Math.round(300 + (2700 * ((ys[i] ?? 0) - first)) / len)}ms`),
    );
  };

  measure();
  if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(seq);
  else addEventListener('resize', measure);
}
