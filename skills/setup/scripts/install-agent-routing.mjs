#!/usr/bin/env node
// Add or refresh the managed prompt-routing block without replacing project rules.
import { readFile, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(here, '../instructions/agent-routing.md');
const startMarker = '<!-- sistemigro/common-skills agent routing:start -->';
const endMarker = '<!-- sistemigro/common-skills agent routing:end -->';
const targets = ['AGENTS.md', 'CLAUDE.md'];

function mergeInstructions(existing, managedBlock, target) {
  const startCount = existing.split(startMarker).length - 1;
  const endCount = existing.split(endMarker).length - 1;
  if (startCount === 0 && endCount === 0) {
    if (!existing) return `${managedBlock.trim()}\n`;
    return `${existing.trimEnd()}\n\n${managedBlock.trim()}\n`;
  }
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`${target}: routing markers are incomplete or duplicated; left unchanged`);
  }

  const start = existing.indexOf(startMarker);
  const end = existing.indexOf(endMarker);
  if (end < start) throw new Error(`${target}: routing markers are out of order; left unchanged`);

  const prefix = existing.slice(0, start).trimEnd();
  const suffix = existing.slice(end + endMarker.length).trimStart();
  return [prefix, managedBlock.trim(), suffix].filter(Boolean).join('\n\n') + '\n';
}

async function main() {
  const managedBlock = (await readFile(templatePath, 'utf8')).trim();
  let updatedCount = 0;
  let unchangedCount = 0;
  let failedCount = 0;

  for (const target of targets) {
    try {
      const stat = await lstat(target).catch((error) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (stat?.isSymbolicLink()) {
        throw new Error(`${target} is a symlink; refusing to change an external instructions file`);
      }

      const existing = stat ? await readFile(target, 'utf8') : '';
      const updated = mergeInstructions(existing, managedBlock, target);
      if (updated === existing) {
        unchangedCount += 1;
        continue;
      }
      await writeFile(target, updated, { encoding: 'utf8', mode: 0o644 });
      console.log(`  ✓ agent routing instructions installed in ${target}`);
      updatedCount += 1;
    } catch (error) {
      console.error(`  ! ${error.message}`);
      failedCount += 1;
    }
  }

  if (unchangedCount) console.log(`  ${unchangedCount} project instruction file(s) already up to date`);
  if (failedCount) {
    console.error(`${failedCount} project instruction file(s) could not be updated.`);
    process.exitCode = 1;
  } else if (updatedCount === 0) {
    console.log('  agent routing instructions already current');
  }
}

main().catch((error) => {
  console.error(`Could not install agent routing instructions: ${error.message}`);
  process.exitCode = 1;
});
