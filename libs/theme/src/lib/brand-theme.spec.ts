import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  BRAND_THEME_URL,
  BrandThemeService,
  DEFAULT_BRAND,
  isBrandTheme,
  isSafeUrl,
  isValidColor,
  resolveBrandId,
} from './brand-theme';

describe('resolveBrandId', () => {
  it('accepts short lowercase slugs', () => {
    expect(resolveBrandId('?brand=harbor')).toBe('harbor');
    expect(resolveBrandId('?brand=meadow-2')).toBe('meadow-2');
  });

  it('falls back to the default brand for anything unexpected', () => {
    expect(resolveBrandId('')).toBe(DEFAULT_BRAND);
    expect(resolveBrandId('?brand=../etc/passwd')).toBe(DEFAULT_BRAND);
    expect(resolveBrandId('?brand=has space')).toBe(DEFAULT_BRAND);
    expect(resolveBrandId('?brand=UPPER')).toBe('upper');
  });
});

describe('isValidColor', () => {
  it('accepts hex colours', () => {
    expect(isValidColor('#0e7490')).toBe(true);
    expect(isValidColor('#fff')).toBe(true);
  });

  it('rejects anything that is not a colour', () => {
    expect(isValidColor('')).toBe(false);
    expect(isValidColor('not-a-colour')).toBe(false);
    expect(isValidColor(42)).toBe(false);
    expect(isValidColor('#zzzzzz')).toBe(false);
  });
});

describe('isSafeUrl', () => {
  it('allows relative and http(s) URLs', () => {
    expect(isSafeUrl('./assets/logo.svg', 'http://x/')).toBe(true);
    expect(isSafeUrl('https://example.com/a.svg', 'http://x/')).toBe(true);
  });

  it('rejects javascript:, data: and empty values', () => {
    expect(isSafeUrl('javascript:alert(1)', 'http://x/')).toBe(false);
    expect(isSafeUrl('data:text/html,x', 'http://x/')).toBe(false);
    expect(isSafeUrl('', 'http://x/')).toBe(false);
  });
});

describe('isBrandTheme', () => {
  it('accepts a well-formed brand', () => {
    expect(
      isBrandTheme({
        id: 'harbor',
        name: 'Harbor',
        colors: { brand: '#0e7490' },
      }),
    ).toBe(true);
  });

  it('rejects anything missing id, name or colors', () => {
    expect(isBrandTheme(null)).toBe(false);
    expect(isBrandTheme({ name: 'Harbor', colors: {} })).toBe(false);
    expect(isBrandTheme({ id: 'harbor', colors: {} })).toBe(false);
    expect(isBrandTheme({ id: 'harbor', name: 'Harbor' })).toBe(false);
  });
});

describe('BrandThemeService', () => {
  let service: BrandThemeService;
  let http: HttpTestingController;

  const setup = (): void => {
    // Brand variables are inline styles on the shared document; clear them so
    // each test starts from the neutral palette.
    document.documentElement.removeAttribute('style');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BRAND_THEME_URL,
          useValue: (brand: string) => `/assets/brands/${brand}.json`,
        },
      ],
    });
    service = TestBed.inject(BrandThemeService);
    http = TestBed.inject(HttpTestingController);
  };

  const theme = (overrides: Record<string, unknown> = {}): object => ({
    id: 'harbor',
    name: 'Harbor',
    tenantLabel: 'Our Harbor',
    tagline: 'Calm waters, clear code.',
    taglineSub: 'A demo brand.',
    logo: { url: './assets/logo.svg', alt: 'Harbor' },
    colors: { brand: '#0e7490', accent: '#0f766e' },
    ...overrides,
  });

  it('applies a fetched brand to the document', async () => {
    setup();
    const promise = service.applyBrand('harbor');
    http.expectOne('/assets/brands/harbor.json').flush(theme());
    await promise;

    expect(service.theme()?.id).toBe('harbor');
    expect(
      document.documentElement.style.getPropertyValue('--color-brand'),
    ).toBe('#0e7490');
    expect(
      document.documentElement.style.getPropertyValue('--color-accent'),
    ).toBe('#0f766e');
  });

  it('keeps the neutral palette when the fetch fails', async () => {
    setup();
    const promise = service.applyBrand('nope');
    http.expectOne('/assets/brands/nope.json').error(new ProgressEvent('error'));
    await promise;

    expect(service.theme()).toBeNull();
    expect(
      document.documentElement.style.getPropertyValue('--color-brand'),
    ).toBe('');
  });

  it('ignores invalid colours without dropping the rest', async () => {
    setup();
    const promise = service.applyBrand('harbor');
    http
      .expectOne('/assets/brands/harbor.json')
      .flush(theme({ colors: { brand: 'not-a-colour', accent: '#0f766e' } }));
    await promise;

    expect(
      document.documentElement.style.getPropertyValue('--color-brand'),
    ).toBe('');
    expect(
      document.documentElement.style.getPropertyValue('--color-accent'),
    ).toBe('#0f766e');
  });

  it('sanitizes an unsafe logo URL', async () => {
    setup();
    const promise = service.applyBrand('harbor');
    http
      .expectOne('/assets/brands/harbor.json')
      .flush(theme({ logo: { url: 'javascript:alert(1)', alt: 'Harbor' } }));
    await promise;

    expect(service.theme()?.logo.url).toBe('');
    expect(service.theme()?.logo.alt).toBe('Harbor');
  });
});
