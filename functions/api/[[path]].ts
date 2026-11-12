/**
 * Mock API for the deployed app, served by Cloudflare Pages Functions.
 *
 * Everything is keyed by tenant: data endpoints read the `X-Tenant-Id` header
 * (the Angular app sends it via its tenant interceptor) and return that
 * tenant's dataset, so switching tenant swaps the entire app's data.
 *
 * Auth is fake: any well-formed email logs in. `single@example.com` logs into one
 * tenant (the chooser path), anything else belongs to all three.
 */

interface Tenant {
  id: string;
  name: string;
  logo: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'on-hold' | 'archived';
  progress: number;
  due: string;
  lead: string;
  members: string[];
  tasks: { total: number; done: number };
}

interface Task {
  id: string;
  title: string;
  projectId: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  due: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Project Lead' | 'Member' | 'Viewer';
  status: 'active' | 'invited';
}

const TENANTS: Tenant[] = [
  { id: 'solstice', name: 'Solstice', logo: './assets/brands/solstice-logo.svg', role: 'Owner' },
  { id: 'harbor', name: 'Harbor', logo: './assets/brands/harbor-logo.svg', role: 'Admin' },
  { id: 'meadow', name: 'Meadow', logo: './assets/brands/meadow-logo.svg', role: 'Member' },
];

const USER = { id: 'u-alex', name: 'Alex Rivera', email: '' };

// ── Per-tenant datasets keyed by tenant id ────────────────────────────────

const PROJECTS: Record<string, Project[]> = {
  solstice: [
    { id: 'p1', name: 'Rise 2.0', description: 'Rebuild the onboarding flow around the new design language.', status: 'active', progress: 72, due: '2026-12-04', lead: 'u-1', members: ['u-1', 'u-2', 'u-3'], tasks: { total: 14, done: 10 } },
    { id: 'p2', name: 'Ember Analytics', description: 'Event pipeline and dashboards for the platform team.', status: 'active', progress: 41, due: '2026-12-18', lead: 'u-2', members: ['u-1', 'u-2'], tasks: { total: 21, done: 9 } },
    { id: 'p3', name: 'Sunrise Mobile', description: 'First-class mobile experience for field workers.', status: 'on-hold', progress: 32, due: '2027-01-15', lead: 'u-4', members: ['u-3', 'u-4', 'u-5'], tasks: { total: 18, done: 6 } },
  ],
  harbor: [
    { id: 'p1', name: 'Dock Rebrand', description: 'New identity across marketing and product surfaces.', status: 'active', progress: 85, due: '2026-11-28', lead: 'u-1', members: ['u-1', 'u-3'], tasks: { total: 12, done: 10 } },
    { id: 'p2', name: 'Tide API', description: 'Public API for harbor integrations and partners.', status: 'active', progress: 58, due: '2026-12-10', lead: 'u-2', members: ['u-1', 'u-2', 'u-4'], tasks: { total: 19, done: 11 } },
    { id: 'p3', name: 'Pilot Program', description: 'Design partner onboarding and feedback loop.', status: 'active', progress: 22, due: '2026-12-22', lead: 'u-3', members: ['u-3', 'u-5'], tasks: { total: 8, done: 7 } },
  ],
  meadow: [
    { id: 'p1', name: 'Field Notes', description: 'Offline-first note taking for agronomists.', status: 'active', progress: 64, due: '2026-12-08', lead: 'u-1', members: ['u-1', 'u-2', 'u-4', 'u-5'], tasks: { total: 16, done: 10 } },
    { id: 'p2', name: 'Graze Reports', description: 'Seasonal report builder for farm advisors.', status: 'on-hold', progress: 47, due: '2027-01-06', lead: 'u-3', members: ['u-2', 'u-3'], tasks: { total: 11, done: 5 } },
  ],
};

const TASKS: Record<string, Task[]> = {
  solstice: [
    { id: 't1', title: 'Sketch the new onboarding flow', projectId: 'p1', assignee: 'u-2', status: 'done', priority: 'high', due: '2026-11-14' },
    { id: 't2', title: 'Audit event taxonomy', projectId: 'p2', assignee: 'u-1', status: 'in_progress', priority: 'high', due: '2026-11-20' },
    { id: 't3', title: 'Prototype push notifications', projectId: 'p3', assignee: 'u-4', status: 'todo', priority: 'medium', due: '2026-11-27' },
    { id: 't4', title: 'Write dashboard copy', projectId: 'p1', assignee: 'u-3', status: 'in_progress', priority: 'medium', due: '2026-11-19' },
    { id: 't5', title: 'Backfill funnel retention chart', projectId: 'p2', assignee: 'u-2', status: 'todo', priority: 'low', due: '2026-12-02' },
    { id: 't6', title: 'Fix date-picker RTL alignment', projectId: 'p1', assignee: 'u-1', status: 'done', priority: 'high', due: '2026-11-12' },
  ],
  harbor: [
    { id: 't1', title: 'Lock the primary color tokens', projectId: 'p1', assignee: 'u-3', status: 'done', priority: 'high', due: '2026-11-15' },
    { id: 't2', title: 'OpenAPI spec for tide endpoints', projectId: 'p2', assignee: 'u-2', status: 'in_progress', priority: 'high', due: '2026-11-22' },
    { id: 't3', title: 'Recruit pilot partners', projectId: 'p3', assignee: 'u-5', status: 'in_progress', priority: 'medium', due: '2026-12-01' },
    { id: 't4', title: 'Rate-limit the public API', projectId: 'p2', assignee: 'u-4', status: 'todo', priority: 'high', due: '2026-11-25' },
    { id: 't5', title: 'Mint the new wordmark', projectId: 'p1', assignee: 'u-1', status: 'done', priority: 'medium', due: '2026-11-18' },
  ],
  meadow: [
    { id: 't1', title: 'Sync engine for offline mode', projectId: 'p1', assignee: 'u-2', status: 'in_progress', priority: 'high', due: '2026-11-21' },
    { id: 't2', title: 'Crop rotation data model', projectId: 'p1', assignee: 'u-4', status: 'done', priority: 'medium', due: '2026-11-16' },
    { id: 't3', title: 'Template the seasonal report', projectId: 'p2', assignee: 'u-3', status: 'todo', priority: 'low', due: '2026-12-05' },
    { id: 't4', title: 'Field photo compression', projectId: 'p1', assignee: 'u-5', status: 'todo', priority: 'medium', due: '2026-11-28' },
  ],
};

const TEAM: Record<string, Member[]> = {
  solstice: [
    { id: 'u-1', name: 'Alex Rivera', email: 'alex@example.com', role: 'Admin', status: 'active' },
    { id: 'u-2', name: 'Maya Chen', email: 'maya@example.com', role: 'Project Lead', status: 'active' },
    { id: 'u-3', name: 'Noah Okafor', email: 'noah@example.com', role: 'Member', status: 'active' },
    { id: 'u-4', name: 'Priya Nair', email: 'priya@example.com', role: 'Member', status: 'active' },
    { id: 'u-5', name: 'Leo Alvarez', email: 'leo@example.com', role: 'Viewer', status: 'invited' },
  ],
  harbor: [
    { id: 'u-1', name: 'Alex Rivera', email: 'alex@example.com', role: 'Admin', status: 'active' },
    { id: 'u-3', name: 'Noah Okafor', email: 'noah@example.com', role: 'Project Lead', status: 'active' },
    { id: 'u-2', name: 'Maya Chen', email: 'maya@example.com', role: 'Member', status: 'active' },
    { id: 'u-4', name: 'Priya Nair', email: 'priya@example.com', role: 'Viewer', status: 'invited' },
  ],
  meadow: [
    { id: 'u-1', name: 'Alex Rivera', email: 'alex@example.com', role: 'Admin', status: 'active' },
    { id: 'u-5', name: 'Leo Alvarez', email: 'leo@example.com', role: 'Project Lead', status: 'active' },
    { id: 'u-2', name: 'Maya Chen', email: 'maya@example.com', role: 'Member', status: 'active' },
    { id: 'u-4', name: 'Priya Nair', email: 'priya@example.com', role: 'Member', status: 'active' },
  ],
};

const SETTINGS: Record<string, Record<string, string | number>> = {
  solstice: { name: 'Solstice', domain: 'solstice.dev', seats: 5, seatsUsed: 5 },
  harbor: { name: 'Harbor', domain: 'harbor.dev', seats: 5, seatsUsed: 4 },
  meadow: { name: 'Meadow', domain: 'meadow.dev', seats: 5, seatsUsed: 4 },
};

const BILLING: Record<string, unknown> = {
  solstice: { plan: 'Scale', price: '$19 / seat / month', seats: 5, usage: [{ label: 'Seats', pct: 100 }, { label: 'Storage', pct: 68 }, { label: 'API calls', pct: 24 }], invoices: [{ id: 'INV-2041', date: '2026-10-01', amount: '$95.00', status: 'paid' }, { id: 'INV-2040', date: '2026-09-01', amount: '$95.00', status: 'paid' }, { id: 'INV-2039', date: '2026-08-01', amount: '$95.00', status: 'due' }] },
  harbor: { plan: 'Growth', price: '$24 / seat / month', seats: 5, usage: [{ label: 'Seats', pct: 80 }, { label: 'Storage', pct: 41 }, { label: 'API calls', pct: 12 }], invoices: [{ id: 'INV-1833', date: '2026-10-01', amount: '$96.00', status: 'paid' }, { id: 'INV-1832', date: '2026-09-01', amount: '$96.00', status: 'paid' }] },
  meadow: { plan: 'Free', price: '$0 — up to 5 seats', seats: 5, usage: [{ label: 'Seats', pct: 80 }, { label: 'Storage', pct: 22 }, { label: 'API calls', pct: 3 }], invoices: [] },
};

// ── Handlers ───────────────────────────────────────────────────────────────

const badRequest = (message: string): Response =>
  Response.json({ error: { code: 'E_BAD_REQUEST', message } }, { status: 400 });

const notFound = (message = 'No mock for this request'): Response =>
  Response.json({ error: { code: 'E_NOT_FOUND', message } }, { status: 404 });

const json = (body: unknown, status = 200): Response =>
  Response.json(body, { status, headers: { 'access-control-allow-origin': '*' } });

const tenantOf = (request: Request): Tenant | null => {
  const id = request.headers.get('x-tenant-id');
  return TENANTS.find((t) => t.id === id) ?? null;
};

const dashboardOf = (tenantId: string) => {
  const projects = PROJECTS[tenantId] ?? [];
  return {
    tenantId,
    stats: [
      { label: 'Active projects', value: projects.filter((p) => p.status === 'active').length, delta: '+1' },
      { label: 'Open tasks', value: (TASKS[tenantId] ?? []).filter((t) => t.status !== 'done').length, delta: '-' },
      { label: 'Team members', value: (TEAM[tenantId] ?? []).filter((m) => m.status === 'active').length, delta: '' },
      { label: 'Completion', value: Math.round((projects.reduce((a, p) => a + p.tasks.done, 0) / Math.max(1, projects.reduce((a, p) => a + p.tasks.total, 0))) * 100) + '%', delta: '' },
    ],
    projects: projects.slice(0, 3),
    activity: (TASKS[tenantId] ?? []).slice(0, 4).map((t) => ({
      id: t.id,
      title: t.title,
      when: t.due,
      done: t.status === 'done',
    })),
  };
};

const route = [
  // Exact routes ------------------------------------------------------------
  ['POST /api/auth/login', (request: Request) => login(request)],
  ['GET /api/dashboard', tenantScoped((t) => json(dashboardOf(t.id)))],
  ['GET /api/projects', tenantScoped((t) => json({ projects: PROJECTS[t.id] ?? [] }))],
  ['GET /api/tasks', tenantScoped((t) => json({ tasks: TASKS[t.id] ?? [] }))],
  ['GET /api/team', tenantScoped((t) => json({ members: TEAM[t.id] ?? [] }))],
  ['GET /api/settings', tenantScoped((t) => json({ ...SETTINGS[t.id], logo: logoOf(t.id) }))],
  ['PATCH /api/settings', tenantScoped((t) => patchSettings(t.id))],
  ['POST /api/settings/logo', tenantScoped((t) => json({ url: logoOf(t.id), name: 'logo.svg' }))],
  ['GET /api/billing', tenantScoped((t) => json(BILLING[t.id] ?? {}))],
  ['GET /api/v1/profile', () => json({ data: { id: USER.id, name: USER.name } })],
] as const;

function logoOf(tenantId: string): string {
  return TENANTS.find((t) => t.id === tenantId)?.logo ?? './assets/logo.svg';
}

function tenantScoped(handler: (tenant: Tenant) => Promise<Response> | Response) {
  return (request: Request) => {
    const tenant = tenantOf(request);
    if (!tenant) return badRequest('X-Tenant-Id header is required');
    return handler(tenant);
  };
}

async function login(request: Request): Promise<Response> {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = (body.email ?? '').trim();
  if (!email || !email.includes('@') || !body.password) {
    return badRequest('a well-formed email and a password are required (this is a mock)');
  }
  const tenants =
    email.startsWith('single@')
      ? [TENANTS[0]]
      : TENANTS;
  return json(
    {
      token: 'mock-token-' + Math.random().toString(36).slice(2, 10),
      user: { ...USER, email },
      tenants,
    },
    200,
  );
}

async function patchSettings(tenantId: string): Promise<Response> {
  // No body parsing needed for the demo — a name echoes back, a domain too.
  const current = SETTINGS[tenantId] ?? {};
  return json({ ...current, logo: logoOf(tenantId) }, 200);
}

export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) {
    return notFound();
  }

  // Dynamic routes like /api/projects/:id
  const match = url.pathname.match(/^\/api\/projects\/([\w-]+)$/);
  if (match && request.method === 'GET') {
    const tenant = tenantOf(request);
    if (!tenant) return badRequest('X-Tenant-Id header is required');
    const project = (PROJECTS[tenant.id] ?? []).find((p) => p.id === match[1]);
    if (!project) return notFound('No project with that id for this tenant');
    return json({
      project,
      tasks: (TASKS[tenant.id] ?? []).filter((t) => t.projectId === project.id),
      members: (TEAM[tenant.id] ?? []).filter((m) => project.members.includes(m.id)),
    });
  }

  const handler = route.find(([key]) => key === `${request.method} ${url.pathname}`);
  if (!handler) return notFound();
  return handler[1](request);
};
