/** Neon region from the connection host (e.g. ap-southeast-1) — logged once, never the URL itself. */
export function neonRegion(url: string): string {
  const host = url.split('@').pop()?.split(/[/:?]/)[0] ?? '';
  return /\.([a-z]{2}(?:-[a-z]+)+-\d)\.(?:aws|azure|gcp)\.neon\.tech$/.exec(host)?.[1] ?? 'unknown';
}
