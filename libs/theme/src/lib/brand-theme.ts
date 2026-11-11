import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal,
} from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

/**
 * Runtime brand theming for the demo.
 *
 * A brand is described by data, not by a build: colours, a tagline and a logo.
 * The app fetches that JSON at startup, then sets the matching `--color-*`
 * variables on `<html>` — the same seam the neutral palette uses, so a brand
 * restyles every CTA, link and chip without touching a component. Inline styles
 * beat the stylesheet, and surfaces/text stay theme-controlled, so brand
 * colours read identically on light and dark.
 *
 * Everything that crosses the trust boundary is validated: the `?brand=` value
 * ends up in a URL, and the JSON values end up in `style` and `src`.
 */

/**
 * The tokens a brand may set. Deliberately the same family the neutral palette
 * uses (`--color-*`), so there is one theming seam, not a second namespace.
 */
export const BRAND_TOKENS = [
  'brand',
  'brand-hover',
  'brand-subtle',
  'accent',
  'link',
  'progress',
] as const;

export type BrandToken = (typeof BRAND_TOKENS)[number];

export interface BrandTheme {
  id: string;
  name: string;
  /** Sidebar label for the brand's own space, e.g. "Our Solstice". */
  tenantLabel: string;
  tagline: string;
  taglineSub: string;
  logo: { url: string; alt: string };
  colors: Partial<Record<BrandToken, string>>;
  fonts?: { display?: string };
}

/** Used when `?brand=` is absent or invalid. */
export const DEFAULT_BRAND = 'solstice';

/** How long startup may wait for branding before falling back to the defaults. */
export const BRAND_LOAD_TIMEOUT_MS = 3000;

/** Maps a brand id to the URL of its branding JSON. Supplied by the app. */
export const BRAND_THEME_URL = new InjectionToken<(brand: string) => string>(
  'BRAND_THEME_URL',
);

const BRAND_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,31}$/;
const FONT_FAMILY_PATTERN = /^[\w\s,'"-]{1,120}$/;

/**
 * Reads `?brand=` from a location search string. Anything that is not a short
 * lowercase slug falls back, so the value can never alter the request path
 * (`../`, slashes, encoded separators).
 */
export function resolveBrandId(
  search: string,
  fallback: string = DEFAULT_BRAND,
): string {
  const raw = new URLSearchParams(search).get('brand')?.toLowerCase() ?? '';
  return BRAND_ID_PATTERN.test(raw) ? raw : fallback;
}

/** True for anything the browser accepts as a CSS colour. */
export function isValidColor(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 100) {
    return false;
  }
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    return CSS.supports('color', value);
  }
  return /^#[0-9a-f]{3,8}$/i.test(value);
}

/** Only http(s) or a relative path; never `javascript:` or `data:`. */
export function isSafeUrl(value: unknown, base: string): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    const { protocol } = new URL(value, base);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export function isBrandTheme(value: unknown): value is BrandTheme {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    typeof v['name'] === 'string' &&
    typeof v['colors'] === 'object' &&
    v['colors'] !== null
  );
}

/** A readable reason for the log; `String(HttpErrorResponse)` is `[object Object]`. */
function describeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    return `HTTP ${error.status} for ${error.url ?? 'the branding URL'}`;
  }
  return error instanceof Error ? error.message : String(error);
}

export interface BrandThemeOptions {
  /** Brand id -> URL of its JSON. Relative URLs keep sub-path hosting working. */
  urlFor: (brand: string) => string;
}

/**
 * Registers branding and loads it before first render, so there is no flash of
 * the default brand. The load never rejects: on any failure the app starts with
 * the neutral palette.
 */
export function provideBrandTheme(
  options: BrandThemeOptions,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: BRAND_THEME_URL, useValue: options.urlFor },
    provideAppInitializer(() => inject(BrandThemeService).load()),
  ]);
}

@Injectable({ providedIn: 'root' })
export class BrandThemeService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly urlFor = inject(BRAND_THEME_URL);

  /** The brand id currently applied, so switching to the same one is a no-op. */
  private current = '';

  private readonly _theme = signal<BrandTheme | null>(null);
  /** The active brand, or `null` while loading or after a failed load. */
  readonly theme = this._theme.asReadonly();

  async load(): Promise<void> {
    await this.applyBrand(resolveBrandId(this.document.defaultView?.location.search ?? ''));
  }

  /**
   * Fetches a brand's JSON and applies it. Resolves even when the fetch fails
   * (the neutral palette stays in effect), so callers never need to handle
   * failures. Used by `?brand=` at startup and by the demo switcher.
   */
  async applyBrand(brandId: string): Promise<void> {
    const id = resolveBrandId(`?brand=${brandId}`);
    if (id === this.current) return;

    try {
      const theme = await firstValueFrom(
        this.http
          .get<unknown>(this.urlFor(id))
          .pipe(timeout(BRAND_LOAD_TIMEOUT_MS)),
      );
      if (!isBrandTheme(theme)) {
        throw new Error(`"${id}" is not a valid brand definition`);
      }
      this.apply(theme);
      this.current = id;
    } catch (error) {
      console.warn(`[brand] keeping the neutral palette — ${describeError(error)}`);
    }
  }

  /** Applies a brand, replacing whichever one was active. */
  apply(theme: BrandTheme): void {
    const style = this.document.documentElement.style;
    this._theme.set({
      ...theme,
      logo: isSafeUrl(theme.logo?.url, this.document.baseURI)
        ? theme.logo
        : { url: '', alt: theme.logo?.alt ?? theme.name },
    });

    for (const token of BRAND_TOKENS) {
      const value = theme.colors[token];
      if (value === undefined) continue;
      if (isValidColor(value)) style.setProperty(`--color-${token}`, value);
      else console.warn(`[brand] ignoring invalid colour for "${token}"`);
    }

    const display = theme.fonts?.display;
    if (display && FONT_FAMILY_PATTERN.test(display)) {
      style.setProperty('--font-display', display);
    }
  }
}