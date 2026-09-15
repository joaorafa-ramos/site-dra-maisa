import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Proves the server under test serves this worktree's fresh build, byte for byte.
// Plain JavaScript on purpose: the project does not ship Node type definitions for `astro check`.
/** @param {import('@playwright/test').FullConfig} config */
export default async function verifyOrigin(config) {
  const baseURL = config.projects[0].use.baseURL;
  const distIndex = fileURLToPath(new URL('../../dist/index.html', import.meta.url));
  const [served, built] = await Promise.all([
    fetch(baseURL).then(response => response.text()),
    readFile(distIndex, 'utf8'),
  ]);
  if (served !== built) {
    throw new Error(`E2E origin mismatch: ${baseURL} does not serve ${distIndex}. Stop the other server or set E2E_PORT.`);
  }
  console.log(`E2E origin verified: ${baseURL} serves ${distIndex}`);
}
