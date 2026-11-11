/**
 * Mock API for the deployed app, served by Cloudflare Pages Functions.
 *
 * Fungular has no backend: on Cloudflare, `/api/*` is answered here, with the
 * same `METHOD /path` table shape the old browser-side interceptor used. Add a
 * mock under `MOCK_ROUTES` and it works locally (`wrangler pages dev`) and in
 * production alike. Swap this directory for a real Worker or backend later —
 * the app only ever calls same-origin `/api/*` URLs.
 */

const MOCK_ROUTES: Record<string, unknown> = {
  'GET /api/v1/profile': { data: { id: 'u-alex', name: 'Alex Rivera' } },
};

const NOT_FOUND = { error: { code: 'E_NOT_FOUND', message: 'No mock for this request' } };

export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const body = MOCK_ROUTES[`${request.method} ${url.pathname}`];

  if (body === undefined) {
    return Response.json(NOT_FOUND, { status: 404 });
  }

  return Response.json(body, {
    headers: { 'access-control-allow-origin': '*' },
  });
};
