// Serves the prerendered Vercel output (.vercel/output/static) the way Vercel does, including the
// `headers` from vercel.json (CSP, HSTS…), so tests and `npm run preview` exercise the real headers.
// Usage: node scripts/serve-static.mjs [dir] [port]. /api/* isn't served — tests mock it.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.vercel/output/static');
const port = Number(process.argv[3] ?? 4321);
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
// vercel.json `source` patterns here are simple regex-compatible paths like "/(.*)".
const rules = (config.headers ?? []).map((r) => ({
  re: new RegExp(`^${r.source}$`),
  headers: r.headers,
}));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

async function resolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  for (const candidate of [clean, `${clean}.html`, path.join(clean, 'index.html')]) {
    const file = path.join(root, candidate);
    if (!file.startsWith(root)) continue;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

http
  .createServer(async (req, res) => {
    const urlPath = new URL(req.url ?? '/', 'http://x').pathname;
    for (const rule of rules) {
      if (rule.re.test(urlPath)) for (const h of rule.headers) res.setHeader(h.key, h.value);
    }
    const file = await resolve(urlPath);
    const status = file ? 200 : 404;
    const target = file ?? path.join(root, '404.html');
    res.writeHead(status, {
      'Content-Type': TYPES[path.extname(target)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(await readFile(target));
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
