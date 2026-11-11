import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/angular-vite';
import { mergeConfig } from 'vite';

const workspaceRoot = resolve(import.meta.dirname, '../../../..');

/** Maps each exact-match `paths` entry in `tsconfig.base.json` to an absolute file. */
const tsconfigPathAliases = (): Record<string, string> => {
  const { compilerOptions } = JSON.parse(
    readFileSync(resolve(workspaceRoot, 'tsconfig.base.json'), 'utf8'),
  ) as { compilerOptions: { paths: Record<string, [string, ...string[]]> } };

  return Object.fromEntries(
    Object.entries(compilerOptions.paths).map(([alias, [target]]) => [
      alias,
      resolve(workspaceRoot, target),
    ]),
  );
};

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: '@storybook/angular-vite',
    options: {},
  },
  /**
   * Served straight from the demo app so Storybook needs no assets of its own:
   * `public/` carries the self-hosted Inter files and their `fonts/fonts.css`, and `assets/` carries the real i18n bundles —
   * the translate pipe in page-header/language-select/header loads them over
   * HTTP at runtime, which keeps the ui lib from *importing* app files (the
   * module boundaries forbid that; serving is not importing).
   */
  staticDirs: [
    { from: '../../../../apps/demo-app/public', to: '/' },
    { from: '../../../../apps/demo-app/src/assets', to: '/assets' },
  ],
  // Vite ignores tsconfig `paths`, so they are turned into `resolve.alias` entries here.
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, { resolve: { alias: tsconfigPathAliases() } }),
};

export default config;
