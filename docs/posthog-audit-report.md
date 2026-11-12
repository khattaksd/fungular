# PostHog Audit Report

## Summary

This audit covered the browser-side Angular integration and PostHog's server-computed project health. The SDK installation and core identity handling are largely sound, but PostHog currently reports no live pageview or screen events, and the integration has additional identity-ordering, delivery, growth-event, and project-configuration gaps.

**Counts**

- **Errors**: 1 (must fix)
- **Warnings**: 5 (should fix)
- **Suggestions**: 2 (nice to have)
- **Passes**: 9

**Problematic items** _(only `error`, `warning`, `suggestion` — no passes)_

| Severity     | Area           | Check                                          | File                                                | Details                                                                                                                            |
| ------------ | -------------- | ---------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `error`      | Live Data      | No live events                                 |                                                     | Verify any events are landing, ensure PostHog initializes with the correct project token, and keep pageview capture enabled.       |
| `warning`    | Identification | identify() called before captures / flag evals | libs/shared/analytics/src/lib/posthog.service.ts:98 | Automatic initial pageview capture can occur before restored-session identification; fresh login identifies before user_logged_in. |
| `warning`    | Event Capture  | Captures route through a reverse proxy         | libs/shared/analytics/src/lib/posthog.service.ts:99 | Browser capture uses the default PostHog ingest host rather than a first-party reverse proxy.                                      |
| `warning`    | Event Capture  | Key activation events captured                 | libs/session/src/lib/+state/session.store.ts:139    | Login and activation are explicitly captured, but signup and purchase/subscription growth events are missing.                      |
| `warning`    | Live Data      | Authorized URLs not configured                 |                                                     | Add each owned production and staging domain under Project settings → Authorized URLs after confirming ownership.                  |
| `warning`    | Live Data      | Source maps not evaluated                      |                                                     | The source maps recommendation is still computing; recheck after PostHog finishes evaluating frame resolution.                     |
| `suggestion` | Live Data      | Error alerts not evaluated                     |                                                     | The alerts recommendation is still computing; recheck Error tracking → Alerts when computation finishes.                           |
| `suggestion` | Live Data      | Ingestion limits not set                       |                                                     | No ingestion rate limit set for: project, per_issue. Set them in Error tracking → Settings.                                        |

## Run outcome

- **Project changes:** No application source, configuration, dependency, or environment files were changed; the audit was read-only.
- **Files created:** `posthog-audit-report.md` only. The transient audit ledger was removed after completion.
- **Manual steps:** Start with the eight prioritized actions below, especially confirming production events reach Activity → Live events, then re-run the audit after fixes.

## Recommended actions

1. **Live Data · No live events** — PostHog has not observed `$pageview` or `$screen` events in the recent health-check window. _Why it matters:_ Missing pageviews make web funnels, traffic trends, attribution, and session-level analysis incomplete or unusable. _Fix:_ Load the deployed app, confirm events appear in Activity → Live events, then verify the production token and pageview capture if nothing arrives. See [web analytics troubleshooting](https://posthog.com/docs/web-analytics/troubleshooting-and-faq).

2. **Identification · identify() called before captures / flag evals** — The initial automatic pageview can be captured before a restored authenticated session is identified. _Why it matters:_ Early events can remain anonymous or merge late, distorting person-level funnels, retention, and attribution. _Fix:_ Ensure restored-session identification completes before the first identity-sensitive capture at `libs/shared/analytics/src/lib/posthog.service.ts:98`. See [identifying users](https://posthog.com/docs/product-analytics/identify).

3. **Event Capture · Captures route through a reverse proxy** — Browser events are sent directly to the default PostHog ingest host rather than through first-party infrastructure. _Why it matters:_ Tracking blockers can drop a meaningful share of events, biasing funnels, retention, experiments, and replay coverage. _Fix:_ Configure a first-party reverse proxy and point `api_host` at it in `libs/shared/analytics/src/lib/posthog.service.ts:99`. See [reverse proxy docs](https://posthog.com/docs/advanced/proxy).

4. **Event Capture · Key activation events captured** — Explicit signup and purchase/subscription events are absent from the detected growth paths. _Why it matters:_ Autocapture cannot provide a durable semantic contract for acquisition and revenue funnels. _Fix:_ Add static snake_case events at the corresponding success boundaries, following the wrapper usage near `libs/session/src/lib/+state/session.store.ts:139`. See [capturing events](https://posthog.com/docs/product-analytics/capture-events).

5. **Live Data · Authorized URLs not configured** — The project has no authorized URL allowlist. _Why it matters:_ URL-dependent filters and toolbar redirects may not work correctly, weakening web analytics validation. _Fix:_ Add only confirmed production and staging domains under Project settings → Authorized URLs. See [web analytics health](https://posthog.com/docs/web-analytics/troubleshooting-and-faq).

6. **Live Data · Source maps not evaluated** — PostHog's source-map recommendation is still computing, so frame resolution health is not yet known. _Why it matters:_ Unresolved production frames hide failing source lines and can fragment error grouping. _Fix:_ Recheck the recommendation after computation finishes and upload build source maps if unresolved frames are reported. See [source map setup](https://posthog.com/docs/error-tracking/upload-source-maps).

7. **Live Data · Error alerts not evaluated** — PostHog's error-alert recommendation is still computing. _Why it matters:_ Missing issue-created or issue-spiking alerts delays discovery and response to production failures. _Fix:_ Recheck Error tracking → Alerts after computation finishes and wire any disabled triggers. See [error tracking alerts](https://posthog.com/docs/error-tracking/alerts).

8. **Live Data · Ingestion limits not set** — Neither the project-wide nor per-issue error ingestion limit is configured. _Why it matters:_ A noisy exception can inflate event volume and cost while obscuring higher-value issues. _Fix:_ Set both limits under Error tracking → Settings. See [error tracking settings](https://posthog.com/docs/error-tracking).

## Full audit

### Installation

Whether the PostHog SDK is present, current, and initialized the way the framework expects. Everything downstream depends on this: a missing or stale SDK silently changes which events exist and which config options are honoured.

| Check                          | Status | File                                                | Details                                                                                                              |
| ------------------------------ | ------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| PostHog SDK installed          | `pass` | package.json:25                                     | posthog-js@^1.447.15                                                                                                 |
| SDK version up to date         | `pass` | package.json:25                                     | installed 1.447.15, latest 1.447.15                                                                                  |
| Initialization is correct      | `pass` | libs/shared/analytics/src/lib/posthog.service.ts:98 | Browser-only singleton initialization uses environment-backed token and host; both variables are configured in .env. |
| One initialization per runtime | `pass` | libs/shared/analytics/src/lib/posthog.service.ts:98 | Exactly one browser-runtime posthog.init() site found.                                                               |

#### Assumptions and blind spots

_No findings to qualify; the standard checks for this area passed cleanly._

### Identification

Whether the same human maps to one stable `distinct_id` across sessions, runtimes, and logins. Identity defects are the most expensive kind to fix after the fact, because they corrupt person counts, funnels, and retention retroactively rather than going forward.

| Check                                          | Status    | File                                                | Details                                                                                                                            |
| ---------------------------------------------- | --------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Stable distinct_id (not session UUID)          | `pass`    | libs/session/src/lib/+state/session.store.ts:109    | identify() receives auth.user.id, a stable authenticated user identifier rather than the session token or device ID.               |
| identify() called before captures / flag evals | `warning` | libs/shared/analytics/src/lib/posthog.service.ts:98 | Automatic initial pageview capture can occur before restored-session identification; fresh login identifies before user_logged_in. |
| Same distinct_id across client and server      | `pass`    | libs/shared/analytics/src/lib/posthog.service.ts:16 | single runtime                                                                                                                     |
| reset() called on logout / account switch      | `pass`    | libs/session/src/lib/+state/session.store.ts:166    | Logout calls analytics.resetUser(), and direct user switching also resets PostHog state.                                           |

#### Assumptions and blind spots

The static scan followed the detected session store and analytics wrapper, but did not execute every authentication transition. Browser scheduling determines whether automatic pageview capture wins the race with restored-session identification. A fast restore path may reduce or eliminate the observed window, while slow storage or network access can widen it. Verify in live events that the first pageview of an authenticated reload carries the expected stable `distinct_id`.

### Event Capture

Whether events are named consistently, reach PostHog reliably, and cover the moments the business actually reasons about. Gaps here don't break anything visibly; they just leave the questions you want to ask unanswerable.

| Check                                  | Status    | File                                                | Details                                                                                                           |
| -------------------------------------- | --------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Event names are static and consistent  | `pass`    | libs/shared/analytics/src/lib/posthog.service.ts:30 | No direct posthog.capture() call uses a dynamic event name; capture is centralized through the analytics wrapper. |
| Captures route through a reverse proxy | `warning` | libs/shared/analytics/src/lib/posthog.service.ts:99 | Browser capture uses the default PostHog ingest host rather than a first-party reverse proxy.                     |
| Key activation events captured         | `warning` | libs/session/src/lib/+state/session.store.ts:139    | Login and activation are explicitly captured, but signup and purchase/subscription growth events are missing.     |

#### Assumptions and blind spots

The scan checked explicit PostHog capture paths and likely growth surfaces, but it cannot prove that every runtime route or externally hosted checkout was present in this repository. The default ingest host is confirmed by project configuration, while actual blocker loss depends on the deployed audience and network environment. Signup or billing may occur in another service, which would explain missing local events without making the business funnel untracked globally. Verify the production event taxonomy and compare browser requests with live events under realistic blocker conditions.

### Live Data

What PostHog itself has already flagged for this project, read from its recommendations and health checks. These come from ingested data rather than source code, so they catch problems no static scan can see — stack frames that never resolve, syncs that keep failing, alerts nobody wired up.

| Check                          | Status       | File | Details                                                                                                                      |
| ------------------------------ | ------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| Open findings in PostHog       | `pass`       |      | 5 open findings from PostHog                                                                                                 |
| No live events                 | `error`      |      | Verify any events are landing, ensure PostHog initializes with the correct project token, and keep pageview capture enabled. |
| Authorized URLs not configured | `warning`    |      | Add each owned production and staging domain under Project settings → Authorized URLs after confirming ownership.            |
| Error alerts not evaluated     | `suggestion` |      | The alerts recommendation is still computing; recheck Error tracking → Alerts when computation finishes.                     |
| Ingestion limits not set       | `suggestion` |      | No ingestion rate limit set for: project, per_issue. Set them in Error tracking → Settings.                                  |
| Source maps not evaluated      | `warning`    |      | The source maps recommendation is still computing; recheck after PostHog finishes evaluating frame resolution.               |

#### Assumptions and blind spots

These findings reflect what PostHog observed in the recent lookback window, so a project that has just started sending data, or one whose findings haven't been recomputed yet, can show a clean area without being clean. The audit did not independently reproduce server-computed thresholds or inspect untrusted event payloads. A new or intentionally idle project is an alternative explanation for the no-live-events finding. Confirm the deployed application against Activity → Live events and recheck the still-computing recommendations.

### Write report

Whether the local markdown audit artifact was created successfully.

| Check                          | Status    | File | Details |
| ------------------------------ | --------- | ---- | ------- |
| Create posthog-audit-report.md | `pending` |      |         |

#### Assumptions and blind spots

This status is a workflow snapshot taken while the report itself was being generated. Confirm the final file exists and renders as markdown after the audit completes.

### Upload notebook

Whether the local report was mirrored into a shareable PostHog notebook.

| Check                                    | Status    | File | Details |
| ---------------------------------------- | --------- | ---- | ------- |
| Write the report into a PostHog notebook | `pending` |      |         |

#### Assumptions and blind spots

This status is a workflow snapshot taken before notebook upload and verification. The local report remains the source of truth if cloud upload is unavailable or incomplete.

## About this audit

The PostHog wizard runs this audit in stages: SDK installation → init correctness → identification → event capture → live data → this report. The early stages resolve checks against the project's source tree. The live-data stage reads what PostHog already computed from your ingested data — things no source scan can see, like whether stack frames actually resolve. Every result, pass or otherwise, is recorded in the ledger this report was generated from.

- `error` items break correctness now (events lost, identity broken). Fix first.
- `warning` items work today but cause subtle data-quality bugs. Fix when convenient.
- `suggestion` items are best-practice improvements with measurable upside.

Re-run `posthog-wizard audit` after applying fixes to refresh the ledger.
