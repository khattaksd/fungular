# Handoff: PostHog (Phase 2) — pick up here

> Written at the end of the session that built the multi-tenant app shell. Goal of the next
> session: wire PostHog into fungular, using the repo's vendor-neutral analytics seam.
> Everything below is verified state; when instructions conflict with what you find, the repo
> is the source of truth.

## 1. What fungular is

A **multi-tenant Angular 22 playground**, deliberately free of domain and design constraints:
fake sign-in (`any@example.com` / any password; `single@example.com` = one tenant), a workspace
chooser for multi-tenant users, and three fictional tenants (**Solstice · Harbor · Meadow**) that
**are** the themes — choosing a tenant re-themes the app and swaps the entire dataset
(`X-Tenant-Id` header → tenant-keyed mock API).

| Thing | Where |
| --- | --- |
| Repo | https://github.com/khattaksd/fungular (public, MIT) |
| Live | https://fungular.pages.dev (Cloudflare Pages, git-integrated) |
| Deploys | push to `main` → CF builds `npm ci && npx nx build demo-app --configuration=production`, output dir from `wrangler.toml` (`pages_build_output_dir`); PRs get preview URLs automatically |
| CI | GitHub Actions: lint, test+coverage, build, Storybook build, e2e (chromium + mobile-chrome in a Playwright container) |

Stack: Angular 22.2.5 (standalone, **zoneless**), Nx 24, NgRx SignalStore (22.0.1), ngx-translate
(8 languages, RTL), Tailwind 4 + SCSS, Vitest 5 + Spectator, Playwright, Storybook 10 (Vite),
Wrangler 4.160.1, TypeScript 6.

## 2. Local environment (this sandbox)

- **Node**: `engines` demands `^22.22.3 || ^24.15.0 || >=26` and `.npmrc` is `engine-strict`.
  The sandbox's default node (24.13.0) **fails** the floor. Use:
  ```sh
  export PATH=/home/sdk/.local/opt/node-v22.23.4-linux-x64/bin:$PATH   # node 22.23.4 + npm 10.9.9
  ```
- **Wrangler auth**: logged in (OAuth token at `~/.config/.wrangler/config/default.toml`).
  Use the **wrangler CLI** for Cloudflare ops (`wrangler pages deploy|dev|project list|deployment list`).
  Raw `api.cloudflare.com` calls with that token are unreliable (401) — don't bother.
- **gh CLI**: logged in as `khattaksd`.

## 3. Quick map of the workspace

```
apps/demo-app/            composition root: routes(app.routes), shell config, dashboard, guards wiring
libs/session/             EAGER auth (root session store, guest/require-auth/tenant guards, X-Tenant-Id
                          interceptor, /login + /workspaces). Eager-by-design (documented exception).
libs/projects/ tasks/     tenant-scoped feature libs (list/detail/filter), generated with the
team/ billing/            workspace generator (tags, depConstraints, aliases, test floors)
libs/settings/            sync-shape reference + tenant panel (name, fake logo upload)
libs/theme/               neutral tokens (light/dark), ThemeService, BrandThemeService (tenants=brands)
libs/shared/analytics/    ← THE SEAM: ANALYTICS token + NoopAnalytics (vendor-neutral)
libs/shared/{ui,translation,entity,environment}
functions/api/[[path]].ts mock API (Cloudflare Pages Function): auth + tenant-keyed data
```

The **analytics seam is already live**:
- `libs/shared/analytics/src/lib/analytics.ts` — `Analytics` interface
  (`initialize()` / `logEvent(name, params)` / `logPageView(path, title)`) + `ANALYTICS` InjectionToken
  with `NoopAnalytics` factory default.
- `apps/demo-app/src/app/app.config.ts` — a `provideAppInitializer` calls `analytics.initialize()`
  and subscribes to `NavigationEnd`, firing `logPageView(urlAfterRedirects, title.getTitle())` with
  the translated title. **Page views are already wired; you add the vendor impl.**
- `libs/shared/ui/src/lib/core/global-error-handler.ts` → `analytics.logEvent('app_exception', …)`;
  `http-error.interceptor.ts` → `analytics.logEvent('http_error', …)`. These will flow into PostHog
  automatically once registered.
- `.claude/skills/analytics/SKILL.md` documents the exact "adding a vendor" recipe + the token
  override pattern for tests.

## 4. Current state (all verified this session)

- lint: 15 projects ✓ · test with coverage: 12 projects ✓ · production build ✓ · Storybook build ✓
- e2e: 64/64 (chromium + mobile-chrome) ✓ · CI green ✓ · live endpoints verified (auth, tenant
  datasets, deep links, SPA fallback) ✓
- Last commits: `9700951` (mobile e2e fix), `527b802` (multi-tenant shell).
- Session already with user: none of Phase 2 is started.

## 5. The task: Phase 2 — PostHog

### Design decisions already made (earlier in planning; validated against posthog.com docs)

1. **New lib `libs/shared/analytics-posthog`** (tag `scope:analytics-posthog-lib`),
   dep-constrained to only `scope:analytics-lib` + `scope:environment-lib` (add the tag to the
   `scope:demo-app` allow list too). `An implementation lib — not a feature; leaf-like.`
   See `.claude/skills/analytics/SKILL.md` §4 for the exact recipe.
2. **`PostHogAnalytics implements Analytics`** — the only file naming PostHog:
   - `initialize()`: `if (!config.enabled) return;` then **dynamic** `const { default: posthog } = await import('posthog-js');`
     and `posthog.init(key, { api_host, capture_pageview: false, autocapture: true, session_recording: { maskAllInputs: true }, debug: !environment.production })`.
   - `capture_pageview: false` on purpose: this app already drives `$pageview` through the token with
     translated titles; don't double-capture (the docs' `history_change` option is the alternative —
     keep token-driven).
   - `logPageView(p, t)` → `posthog.capture('$pageview', { page_path: p, page_title: t })`.
   - `logEvent(n, params)` → `posthog.capture(n, params)`.
   - Zoneless app: the official docs' `ngZone.runOutsideAngular` dance is irrelevant here (no zone.js).
   - `providePostHogAnalytics()` returns `makeEnvironmentProviders([{ provide: ANALYTICS, useClass: PostHogAnalytics }])`.
3. **Config pipeline** (port from the template; unipla removed it, fungular needs it back for OSS hygiene):
   - `cp config/posthog.example.json config/posthog.json` (git-ignored) → `tools/generate-config.mjs`
     generates `libs/environment/src/lib/generated/posthog.config.ts` on install/build; env scalars
     `POSTHOG_API_KEY` / `POSTHOG_API_HOST` win. **A clone with no config ships analytics-off** — nobody
     else's deployment reports into your project.
   - The old `config/*` + `tools/generate-config.mjs` + `check-no-secrets.mjs` scaffolding exists in
     the template repo (myvictorlife/base-angular-monorepo) if you want to port it wholesale.
   - **e2e safety**: local and CI e2e run without the key → `enabled: false` → zero events. Deployed
     previews/production get the key via CF env vars (Project → Settings → Environment variables,
     Production/Preview scopes). PostHog keys are public-by-design, like Firebase — fine to ship.
4. **Wire in `app.config.ts`**: `...(environment.posthog.enabled ? [providePostHogAnalytics()] : [])`.
   Everything else (init + pageviews) is already there.
5. **Dependency**: `npm i posthog-js@1` (**runtime** dep, dynamic-imported). ~45–65kB gzip in a lazy
   chunk, never in the initial bundle. If the Angular compiler type-checks loudly, the PostHog docs
   prescribe adding `@rrweb/types@2.0.0-alpha.17` + `rrweb-snapshot@2.0.0-alpha.17`; a cleared npm
   cache after that is normal.
6. **Tests**: unit-test `PostHogAnalytics` with `vi.mock('posthog-js')` (assert init called once with
   the right config, `$pageview` params, event passthrough, disabled → no import); component tests
   keep using the `ANALYTICS` token override. Set the lib's coverage floor **just under measured**
   (repo convention; `project.json` test target `coverageThresholds`).
7. **Docs**: new `docs/posthog.md` (config, what's captured, how to find it in the dashboard);
   update `.claude/skills/analytics/SKILL.md` with a PostHog section; update README analytics blurb.
8. **Optional later** (not part of the SDK task): the PostHog MCP server for agent-led flag/insight
   work — `pi mcp add posthog --url "https://mcp.posthog.com/mcp"` then `pi mcp login posthog`
   (OAuth in your browser). Not needed for the integration.

### Learning track after the SDK (free tier: 1M events, 5k replays, 1M flag requests/mo)

Autocapture → funnels over the `$pageview`s → session replay (watch your own usage; masking rules)
→ feature flags (gate a demo feature, e.g. a "beta" project card) → surveys → experiments on the
theme toggle → optionally self-host PostHog (Docker on the $5 box) as a capstone.

## 6. Gotchas learned this session (respect these)

- **Stale local server trap**: Playwright `reuseExistingServer: !CI` reuses a manual `wrangler pages
  dev` on :4200. If you changed app code and e2e behaves stale, kill it first:
  `PID=$(lsof -ti tcp:4200); [ -n "$PID" ] && kill $PID`. Never `pkill -f "wrangler pages dev"` from a
  shell whose own command line contains that string — it kills your own shell (143).
- **Guard loops**: the login route must use `guestOnlyGuard` (signed-in → `/workspaces`; signed-out →
  pass). `requireAuthGuard` on `/login` = infinite redirect. Same class of bug as the coverage floor
  misses — verify with e2e, including mobile.
- **Mobile e2e**: the sidebar is a hidden drawer on phones. Tests that touch sidebar things must open
  `.bar__menu` first when `isVisible()` is false; `getByText(...).first()` can resolve to the drawer's
  hidden copy — scope locators.
- **Coverage floors are tripwires**: set just-under-measured in `project.json` per project; don't
  inflate them. New code that drops a floor → CI fails.
- **i18n**: `i18n-completeness.spec.ts` fails the build if any key is missing from any of the 8
  bundles (en/de/es/fr/nl/pl/pt/ar). Update all bundles together (script it). Demo emails are all
  `@example.com`.
- **Module boundaries are enforced**: a static import of a lazy-loaded feature lib from the app is a
  lint error. Shared models live in `@libs/entity`; auth/session is the **eager** exception.
- **Nx cache**: after editing spec/config files, use `--skip-nx-cache` for the project you touched if
  results look stale.

## 7. Verification before you ship

```sh
export PATH=/home/sdk/.local/opt/node-v22.23.4-linux-x64/bin:$PATH
npm run lint:all
npx nx run-many -t test --coverage --skip-nx-cache
npx nx build demo-app --configuration=production
npx nx build-storybook ui
npx nx e2e demo-app -- --project=chromium --project=mobile-chrome   # 64 tests
```

Deploy: push to `main` (CF auto-deploys; `npm run pages:deploy` = manual alternative). Verify live:
`https://fungular.pages.dev` + `POST /api/auth/login` with an `@example.com` email + tenant-keyed hits
(`-H "X-Tenant-Id: harbor"`) — do the same checks after any function change.

## 8. Open threads (intentionally parked)

- PostHog (this task) · PR-preview e2e via `BASE_URL` (support exists in playwright config) · custom
  domain on the Pages project · any design/brand integration (the `--color-*` token seam is the
  swap point).