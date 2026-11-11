# environment

Build-time configuration. One file per target, swapped by Angular's `fileReplacements`.

**Tag:** `scope:environment-lib` — **may not depend on any other library.**

## Import

```ts
import { environment, commonPaths } from '@libs/environment';
```

## Files

| File                         | Used by                                         | `production` |
| ---------------------------- | ----------------------------------------------- | ------------ |
| `environment.ts`             | `--configuration=production` (default)          | `true`       |
| `environment.development.ts` | `--configuration=development` (`nx serve`)      | `false`      |
| `environment.local.ts`       | `--configuration=local`                         | `false`      |
| `environment.model.ts`       | the `Environment` interface all three implement | —            |
| `api.paths.ts`               | API path constants (`commonPaths`)              | —            |

The replacements are declared in `apps/demo-app/project.json` under each
configuration's `fileReplacements`.

## Why the `Environment` interface exists

Every variant is typed `: Environment`. Without it the files drift and a missing key goes
unnoticed because no build references the variant. A missing key is now a compile error.

**If you add a key, add it to `environment.model.ts` first** — the compiler then tells
you which variants still need it.

## Gotcha

`production` is not "is this a real deployment", it is "should production behaviour be
on". Devtools and verbose logging key off it, so a development variant with
`production: true` silently disables them. Keep it `false` for anything but production.
