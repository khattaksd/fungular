# fungular

A neutral Angular 22 playground: an Nx monorepo — standalone, zoneless, NgRx
SignalStore, ngx-translate (eight languages, RTL included), Tailwind 4, Vitest +
Spectator, Playwright, Storybook — with a **mock API in Cloudflare Pages Functions**, **static-hosting-ready
output**, and a **vendor-neutral analytics seam** (PostHog is the first implementation).

> **Deliberately opinionless about domain and design.** No product entity, no LMS/learner
> concepts, no design-system constraints. The app is a multi-tenant playground: a
> fake sign-in (`any@example.com` works, `single@example.com` logs into one
> workspace), a workspace chooser for people in several tenants, and **three
> fictional tenants — Solstice, Harbor, Meadow** — that are also the themes
> (choosing a tenant re-themes and swaps the whole dataset). The point of fungular
> is the architecture and the patterns, so you can experiment freely: change the
> tenant data, plug in an analytics vendor, deploy it anywhere, build whatever
> domain you like on top.

[![CI](https://github.com/khattaksd/fungular/actions/workflows/ci.yml/badge.svg)](https://github.com/khattaksd/fungular/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick start

```sh
npm install
npm start                       # http://localhost:4200 (Angular dev server)
npm run pages:dev               # full stack: built app + mock API, at http://localhost:4200
npx nx storybook ui             # http://localhost:4400
```

Node `^22.22.3`, `^24.15.0` or `>=26`, as Angular 22 requires, and npm 10.9.8 or later.
`nvm use` picks up `.nvmrc` (22.23.4, the version CI uses); `.npmrc` makes `npm install`
fail on anything outside `engines`. No account is needed.

**Tenants are themes.** Log in as `alex@example.com` and pick Harbor in the
chooser (or flip the sidebar switcher) to watch the palette and the data swap
live. The three tenants live in `apps/demo-app/src/assets/brands/`; Settings has
the OS-synced light/dark toggle.

**No backend? The mock API lives in Cloudflare Pages Functions.** `functions/api/[[path]].ts`
answers `/api/*` with the same `METHOD /path` handlers the app expects — locally via
`wrangler pages dev`, and in production unchanged. `npm run pages:dev` builds the app and
serves the full stack on one port.

## Checks

```sh
npm run lint:all
npm run test:all
npx nx e2e demo-app                              # Playwright, four browsers
npx nx build demo-app --configuration=production
```

CI runs the same set (plus a Storybook build), and the e2e specs can run against a
deployed preview with `BASE_URL`. Details and the rules the linter enforces are in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Stack

Angular 22 (standalone, zoneless), NgRx SignalStore, ngx-translate (8 languages incl.
RTL Arabic), Tailwind 4 + SCSS, Nx, Vitest + Spectator, Playwright, Storybook.

## The app

| Route | What it is |
| --- | --- |
| `/login` | Fake sign-in (`any@example.com` + any password) |
| `/workspaces` | Chooser for users in more than one tenant (multi-tenant after login) |
| `/` | Dashboard: stats, top projects, recent activity |
| `/projects` · `/projects/:id` | Project cards; detail with tasks and members |
| `/tasks` | All tasks — filter by status, priority, search |
| `/team` | Member list with role badges |
| `/settings` | Theme/language/motion plus the workspace panel (name, fake logo upload) |
| `/billing` | Plan, usage meters, invoices |

Every tenant-scoped dataset is keyed by `X-Tenant-Id` (the app's interceptor adds
it), so switching workspace in the sidebar **swaps the entire dataset** — and the
brand theme with it.

## How it fits together

```
apps/demo-app/       the app: routes, pages, shell wiring (the composition root)
libs/profile/        feature library (HTTP shape)
libs/settings/       feature library (synchronous shape)
libs/theme/          neutral design tokens, light/dark ThemeService
libs/shared/ui/      atoms · molecules · organisms · viewport service
libs/shared/{translation,analytics,entity}  libs/environment
```

Libraries are tagged and the linter enforces who may import whom; features never import
each other. Read [`docs/architecture.md`](docs/architecture.md) before adding a library.

## Deployment (Cloudflare Pages)

The app deploys as a static SPA plus the Pages Functions mock — no backend needed:

- Build command: `npm ci && npx nx build demo-app --configuration=production` (or `npm run pages:deploy`)
- Output directory: `dist/apps/demo-app/browser` (set in `wrangler.toml`)
- SPA fallback: `apps/demo-app/public/_redirects` → `/* /index.html 200`; `/api/*` is
  matched by the Functions before the redirect, so the mock is never shadowed
- Every PR gets its own preview deployment; `wrangler pages deploy` publishes from CI or your machine

## Analytics (PostHog)

Analytics is **opt-in and vendor-neutral**. Call sites depend on the `ANALYTICS`
token; the app decides once, in `app.config.ts`, what sits behind it. With nothing
registered, `ANALYTICS` resolves to `NoopAnalytics` — no vendor SDK in the bundle.

To turn PostHog on for a deployment:

1. Create a project in [PostHog](https://posthog.com) and copy your project token and
   API host (usually `https://us.i.posthog.com`).
2. `cp config/posthog.example.json config/posthog.json` and paste the values (the file
   is git-ignored), or set `POSTHOG_API_KEY` / `POSTHOG_API_HOST` as environment
   variables — CI/preview environments win over the file.
3. A clone without the config ships with analytics off, so nobody else's deployment
   ever reports into your project.

Page views are tracked automatically on every route change with the translated
title, and the PostHog implementation lives in `libs/shared/analytics-posthog`.
See [`.claude/skills/analytics/SKILL.md`](.claude/skills/analytics/SKILL.md).

## Documentation

| Doc                                                            | What it is                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`docs/architecture.md`](docs/architecture.md)                 | Layout, theming, library boundaries, state, testing, i18n              |
| [`docs/decisions.md`](docs/decisions.md)                       | What was chosen for this workspace and why                            |
| [`docs/best-practices.md`](docs/best-practices.md)             | Angular and project coding standards                                  |
| [`docs/workspace-generators.md`](docs/workspace-generators.md) | Nx generator reference                                                |
| [`AGENTS.md`](AGENTS.md)                                       | Instructions for AI coding agents (`CLAUDE.md` imports it)            |
| `.claude/skills/`                                              | Step-by-step guides for agents: feature libs, components, state, tests, Storybook, analytics |

## License

MIT — see [`LICENSE`](LICENSE). Portions derive from third-party open-source software;
their notices are kept in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
