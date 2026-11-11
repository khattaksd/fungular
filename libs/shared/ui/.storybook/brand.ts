import { isBrandTheme, type BrandTheme } from '@libs/theme';

/** The three fictional demo brands, in toolbar order. */
export const BRANDS = ['solstice', 'harbor', 'meadow'] as const;
export type StoryBrand = (typeof BRANDS)[number];

const urlFor = (brand: string): string => `./assets/brands/${brand}.json`;

/**
 * Fetches a demo brand's JSON, applies its CSS variables and returns it for the
 * shell stories. Dev-only: the app reads `?brand=` at startup instead.
 */
export async function applyStoryBrand(brand: string): Promise<BrandTheme> {
  const response = await fetch(urlFor(brand));
  const theme: unknown = await response.json();
  if (!isBrandTheme(theme)) throw new Error(`"${brand}" is not a valid brand`);
  return theme;
}
