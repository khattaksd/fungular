#!/usr/bin/env node
/**
 * Pre-commit backstop against credentials entering history.
 *
 * Scans only what is *staged*, because that is the last moment a mistake is still
 * free to fix. Once a key is in a commit that has been pushed, rotating it is the
 * only real remedy — rewriting history is not, since forks and mirrors keep the
 * old objects.
 *
 * Service account JSON, private keys and API keys are blocked outright, so a
 * credential never lands in a tracked file. Per-deployment values belong in
 * CI secrets or behind the API.
 *
 * Escape hatch: `git commit --no-verify`. Deliberately not configurable — a
 * per-file allowlist is how these checks quietly become decorative.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';

/** Extensions worth reading. Binaries and lockfiles are skipped. */
const SCANNABLE =
  /\.(ts|tsx|js|mjs|cjs|json|html|scss|css|md|ya?ml|txt|env|sh)$/i;
const SKIP_PATHS = [
  /^package-lock\.json$/,
  /^\.env\.example$/,
  // Its own rule patterns would match themselves.
  /^tools\/check-no-secrets\.mjs$/,
];

const RULES = [
  {
    name: 'Google API key',
    pattern: /AIza[0-9A-Za-z_-]{35}/,
    hint: 'Keep API keys out of tracked files: use CI secrets, or keep them behind the API.',
  },
  {
    name: 'Google service account key',
    pattern: /"type"\s*:\s*"service_account"/,
    hint: 'Service account keys belong in your CI secret store, never in the repo.',
  },
  {
    name: 'Private key block',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    hint: 'Never commit a private key. If this one was ever pushed, rotate it now.',
  },
  {
    name: 'Hardcoded bearer/API secret',
    pattern:
      /(?:api[_-]?secret|client[_-]?secret|auth[_-]?token)\s*[:=]\s*['"][^'"\s]{16,}['"]/i,
    hint: 'Secrets must not reach a frontend bundle. Proxy them through a backend.',
  },
];

const staged = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACM'],
  {
    encoding: 'utf8',
  },
)
  .split('\n')
  .filter(Boolean);

const findings = [];

for (const file of staged) {
  if (SKIP_PATHS.some((skip) => skip.test(file))) continue;

  // Git-ignored, so reaching here means the file was force-added.
  if (/(^|\/)\.env(\.|$)/.test(file)) {
    findings.push({
      file,
      rule: 'Environment file',
      hint: `Nothing in .env is ever committed. Remove it: \`git rm --cached ${file}\`.`,
    });
    continue;
  }

  if (!SCANNABLE.test(file)) continue;
  if (!existsSync(file) || statSync(file).size > 512 * 1024) continue;

  const contents = readFileSync(file, 'utf8');
  const lines = contents.split('\n');

  for (const rule of RULES) {
    const index = lines.findIndex((line) => rule.pattern.test(line));
    if (index !== -1)
      findings.push({
        file,
        line: index + 1,
        rule: rule.name,
        hint: rule.hint,
      });
  }
}

if (findings.length === 0) process.exit(0);

console.error('\n✖ Possible credentials in staged changes:\n');
for (const { file, line, rule, hint } of findings) {
  console.error(`  ${file}${line ? `:${line}` : ''}`);
  console.error(`    ${rule} — ${hint}\n`);
}
console.error(
  'Commit blocked. Override with `git commit --no-verify` if this is a false positive.\n',
);
process.exit(1);
