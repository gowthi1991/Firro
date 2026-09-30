// Live countdown to the next 21:00 in Asia/Kolkata (the kitchens' cut-off), whatever the
// visitor's timezone. The ring's --p is the elapsed fraction of 24h.
// The interval pauses while the tab is hidden.

const pad = (n: number) => String(n).padStart(2, '0');

const DAY_MS = 86_400_000;
const LOCK_MS = 21 * 3_600_000; // 21:00
const IST_OFFSET_MS = 5.5 * 3_600_000; // Asia/Kolkata is UTC+05:30 all year (no DST)

export function secondsUntilLock(now: Date = new Date()): number {
  const istMsOfDay = (((now.getTime() + IST_OFFSET_MS) % DAY_MS) + DAY_MS) % DAY_MS;
  // exactly 21:00 counts as "passed", so the next lock is a full day away
  const ms = (LOCK_MS - istMsOfDay + DAY_MS) % DAY_MS || DAY_MS;
  return Math.floor(ms / 1000);
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
