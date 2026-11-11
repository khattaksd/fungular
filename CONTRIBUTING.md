# Working in this repository

Open guide for contributors. Agents read [`AGENTS.md`](AGENTS.md) instead; the rules are
the same.

## Setup

```sh
npm install
npm start            # http://localhost:4200
```

Node `^22.22.3`, `^24.15.0` or `>=26`, as Angular 22 requires, and npm 10.9.8 or later.
`nvm use` picks up `.nvmrc` (22.23.4, the version CI uses); `.npmrc` makes `npm install`
fail on anything outside `engines`. No external account is needed to build or run.

## Dependencies

Versions in `package.json` are pinned for the Angular, Nx and NgRx sets; upgrade each set
together. To re-resolve the whole lockfile (after a large upgrade, or when npm reports peer
conflicts it cannot untangle), run:

```sh
npm run deps:relock
```

It deletes `package-lock.json`, resolves a fresh one with npm 11 (npm 10's resolver crashes
on a from-scratch resolve of this tree), then runs a normal `npm ci` with your own npm so
install scripts run. Review the lockfile diff and run the full checks before committing.
If Playwright moved, run `npx playwright install` for its browsers.

Dependabot (`.github/dependabot.yml`) opens weekly PRs. Related packages are grouped
(Angular, Nx, NgRx, Storybook, test tooling, lint and types); merge a grouped PR as a whole,
because splitting it breaks peer ranges. There is no Dependabot equivalent of lock-file
maintenance, so run `npm run deps:relock` periodically.

## Before you push

```sh
npm run lint:all
npm run test:all
npx nx e2e demo-app
npx nx build demo-app --configuration=production
```

CI runs the same four, plus a Storybook build. `nx affected` is fine locally; CI runs everything.

## Rules the linter enforces

The build fails on these; they are not style preferences.

- `@if` / `@for`, never `*ngIf` / `*ngFor`
- `input()` / `output()` functions, never `@Input` / `@Output` decorators
- `ChangeDetectionStrategy.OnPush` on every component
- Standalone components; no `NgModule`
- Import what a template uses, not `CommonModule`
- Library dependency rules from `eslint.base.config.mjs`: a lib may only import from
  the tags listed for its own tag

## Releasing

Not versioned yet. Tag `vX.Y.Z` and update `CHANGELOG.md` when there is something to
tell people about.
