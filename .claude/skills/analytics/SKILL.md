---
name: analytics
description: Log analytics events through the vendor-neutral ANALYTICS token. Use when adding tracking to a component or service, when registering an analytics implementation in app.config.ts, or when adding a vendor.
---

# Skill: Analytics

Analytics is **opt-in and vendor-neutral**. Call sites depend on the `ANALYTICS`
token; the app decides once, in `app.config.ts`, what sits behind it.

No implementation is registered by default, so `ANALYTICS` resolves to
`NoopAnalytics`: no vendor SDK in the bundle and no `if (analytics)` guards
anywhere.

---

## How it works

```
libs/shared/analytics             ← the contract. Depends on nothing.
  ANALYTICS  (InjectionToken, factory default → NoopAnalytics)
  Analytics  (interface: initialize / logEvent / logPageView)

apps/demo-app/src/app/app.config.ts
  provideAppInitializer(...)      ← initialize() + logPageView on NavigationEnd
```

Page views fire automatically on every `NavigationEnd`, with the translated
document title, so no route needs to log anything itself.

---

## 1. The `Analytics` contract

**Location:** `libs/shared/analytics/src/lib/analytics.ts`

| Method          | Signature                                                     | Description                                                          |
| --------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `initialize()`  | `(): Promise<void>`                                           | Called once by the app initializer. Must resolve even when disabled. |
| `logEvent()`    | `(eventName: string, params?: Record<string, unknown>): void` | Logs a custom event.                                                 |
| `logPageView()` | `(pagePath: string, pageTitle?: string): void`                | Logs a `page_view`. Called automatically on route changes.           |

---

## 2. Logging custom events

Inject the **token**, never a concrete implementation:

```typescript
import { Component, inject } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';

export class CheckoutPage {
  private readonly analytics = inject(ANALYTICS);

  onPurchase(itemId: string): void {
    this.analytics.logEvent('purchase', { item_id: itemId, currency: 'USD' });
  }
}
```

`@libs/analytics` is a leaf library — any project may depend on it. Event names
are snake_case (`user_signed_up`, `file_downloaded`), no spaces or special
characters.

---

## 3. Why call sites need no guards

With nothing registered, `ANALYTICS` → `NoopAnalytics` and every method does
nothing. An implementation should degrade the same way (resolve `initialize()`
even when it is disabled, drop events fired before it is ready), so `logEvent()`
is always safe to call. No try/catch, no null checks.

---

## 4. Adding a vendor

Put the implementation in its own library so the vendor SDK stays out of every
other project, and load the SDK with a **dynamic** `import()` so it is fetched
only where analytics is actually enabled:

```typescript
// libs/shared/analytics-<vendor>/src/lib/<vendor>-analytics.providers.ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';
import { VendorAnalytics } from './vendor-analytics';

export function provideVendorAnalytics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ANALYTICS, useClass: VendorAnalytics },
  ]);
}
```

Then:

1. Tag the lib `scope:analytics-<vendor>-lib` and give it a `depConstraints`
   entry in `eslint.base.config.mjs` allowing only `scope:analytics-lib` and
   `scope:environment-lib`.
2. Add that tag to `scope:demo-app`'s allowed list and call
   `provide<Vendor>Analytics()` in `app.config.ts`.

See the `module-boundaries` skill. Do not add a tag without a constraint entry —
an unconstrained tag silently defeats the boundary rules.

---

## 5. Testing

Override the token — that is what it is for:

```typescript
const analytics = {
  logEvent: vi.fn(),
  logPageView: vi.fn(),
  initialize: vi.fn(),
};

TestBed.configureTestingModule({
  providers: [{ provide: ANALYTICS, useValue: analytics }],
});

expect(analytics.logEvent).toHaveBeenCalledWith('purchase', {
  item_id: '1',
  currency: 'USD',
});
```

Tests never need a vendor account or SDK.

---

## Checklist

- [ ] Call sites inject `ANALYTICS` from `@libs/analytics`, never a concrete class
- [ ] A vendor SDK is reached only through `import()`, never a static import
- [ ] Custom event names are snake_case
- [ ] `logEvent()` is called from user actions, not constructors or initializers
- [ ] `initialize()` is called once, from `app.config.ts`
