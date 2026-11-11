# Changelog

Notable changes, newest first.

## Unreleased

### Added

- Initial public release as `fungular`: a scrubbed, neutral derivative of a
  design- and domain-constrained internal proof of concept, open-sourced for
  experimentation.
- Neutral design tokens (Tailwind `neutral` scale) replacing the former
  brand/design-system token layer; no brand theming, no `/design` token page.
- Generic home page and shell navigation (Home / Profile / Settings).
- Cloudflare Pages deployment: production build + `_redirects` SPA fallback
  (`wrangler.toml`, `npm run pages:dev` / `pages:deploy`).
- Mock API moved into a Cloudflare Pages Function (`functions/api/[[path]].ts`),
  replacing the browser-side interceptor; the e2e suite now runs against the
  production bundle + Functions.
- Dark mode enabled: the neutral dark palette now actually themes the app
  (light/dark toggle in Settings follows the OS by default).
- Runtime demo branding: three fictional brands (Solstice, Harbor, Meadow) as
  JSON, applied via `BrandThemeService`; `?brand=` at startup, a live switcher
  on the home page, and a Storybook Brand toolbar. Brand tokens stay on the
  `--color-*` seam so they read on both themes.
- fungular mark: a flat navy peak-and-sunrise logo (`assets/logo.svg`) used as
  favicon, header logo, brand logo and the "Powered by" platform mark.
- Vendor-neutral analytics seam retained from the source codebase; PostHog
  implementation planned (`libs/shared/analytics-posthog`).
