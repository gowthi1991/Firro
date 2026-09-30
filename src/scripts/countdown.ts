// Live countdown to the next 21:00 local time. The ring's --p is the elapsed fraction of 24h.
// The interval pauses while the tab is hidden.

const pad = (n: number) => String(n).padStart(2, '0');

export function secondsUntilLock(now: Date = new Date()): number {
  const lock = new Date(now);
  lock.setHours(21, 0, 0, 0);
  if (lock <= now) lock.setDate(lock.getDate() + 1);
  return Math.floor((lock.getTime() - now.getTime()) / 1000);
}

export function formatHMS(s: number): string {
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}

export function initCountdown(): void {
  const clock = document.querySelector<HTMLElement>('[data-countdown]');
  const ring = document.querySelector<HTMLElement>('[data-countdown-ring]');
  if (!clock) return;

  const tick = () => {
    const s = secondsUntilLock();
    clock.textContent = formatHMS(s);
    ring?.style.setProperty('--p', String(Math.round((1 - s / 86400) * 100)));
  };

  let timer: number | undefined;
  const start = () => {
    tick();
    if (timer === undefined) timer = window.setInterval(tick, 1000);
  };
  const stop = () => {
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
  };

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (!document.hidden) start();
  else tick();
}
