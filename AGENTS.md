# AGENTS.md

Instructions for AI coding agents working in this repository. Humans: start with
[`README.md`](README.md) instead.

## What this repository is

`fungular`: a neutral Angular playground. An Nx monorepo — Angular 22 standalone and
zoneless, NgRx SignalStore, ngx-translate, Tailwind 4, Vitest + Spectator, Playwright,
Storybook — with a browser-side mock API, static-hosting-ready output and a
vendor-neutral analytics seam. It is deliberately **free of domain and design
constraints**: no product entity, no LMS/learner concepts, no brand system, no design
tokens tied to any outside team. Keep it that way — new features should be generic
extensions of the patterns here, not the beginning of a specific product.

## Detailed guides

Task-specific instructions live in `.claude/skills/`. **Read the relevant one
before writing code** — they carry the conventions this workspace actually
enforces, and getting them wrong means a failed lint or a rejected review.

| Doing this                                   | Read                                        |
| ------------------------------------------- | ------------------------------------------- |
| Creating a feature library                   | `.claude/skills/feature-lib/SKILL.md`       |
| Writing any component or template            | `.claude/skills/angular-component/SKILL.md` |
| Adding or changing feature state             | `.claude/skills/ngrx-state/SKILL.md`        |
| Adding a route or a lazy chunk               | `.claude/skills/lazy-loading/SKILL.md`      |
| Creating a library, or a boundary lint error | `.claude/skills/module-boundaries/SKILL.md` |
| Writing tests, or a coverage failure         | `.claude/skills/unit-testing/SKILL.md`      |
| Writing or fixing a Storybook story          | `.claude/skills/storybook/SKILL.md`         |
| Tracking events                             | `.claude/skills/analytics/SKILL.md`         |

Broader background: [`docs/architecture.md`](docs/architecture.md),
[`docs/best-practices.md`](docs/best-practices.md),
[`docs/workspace-generators.md`](docs/workspace-generators.md),
[`docs/decisions.md`](docs/decisions.md).
