// Tablet/mobile menu: a sheet with the five section links.
// Opens from the menu button, closes on Esc, outside click, link tap or when resized to desktop.

export function initNav(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const sheet = document.querySelector<HTMLElement>('[data-nav-sheet]');
  if (!btn || !sheet) return;
  const links = () => [...sheet.querySelectorAll<HTMLAnchorElement>('a')];

  const setOpen = (open: boolean, focusButton = false) => {
    btn.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
    if (open) links()[0]?.focus();
    else if (focusButton) btn.focus();
  };

  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  sheet.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sheet.hidden) setOpen(false, true);
  });
  document.addEventListener('click', (e) => {
    const t = e.target as Node;
    if (!sheet.hidden && !sheet.contains(t) && !btn.contains(t)) setOpen(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
