// POST /api/lead — the only server-rendered route; every page stays prerendered.
import type { APIRoute } from 'astro';
import { createLeadHandler } from '../../server/lead-handler';
import { leadDeps } from '../../server/lead-deps';

export const prerender = false;

let handle: ReturnType<typeof createLeadHandler> | null = null;

export const POST: APIRoute = async (ctx) => {
  handle ??= createLeadHandler(leadDeps());
  let ip: string | undefined;
  try {
    ip = ctx.clientAddress;
  } catch {
    ip = undefined; // not available in every environment
  }
  return handle(ctx.request, ip);
};
