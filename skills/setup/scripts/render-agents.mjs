#!/usr/bin/env node
// Keep skills/setup/agents as the source of truth and render host-native agents.
import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(here, '../agents');
const managedMarker = 'Managed by sistemigro/common-skills.';
const targets = [
  { id: 'claude', host: 'Claude Code', dir: '.claude/agents', extension: '.md' },
  { id: 'cursor', host: 'Cursor', dir: '.cursor/agents', extension: '.md' },
  { id: 'codex', host: 'Codex', dir: '.codex/agents', extension: '.toml' },
];
const renamedAgents = [
  'design-specialist',
  'security-auditor',
  'test-author',
  'plan-researcher',
  'test-suite-runner',
  'ui-responsive-auditor',
  'a11y-auditor',
  'regression-hunter',
];

function selectTargets() {
  const option = process.argv.find((arg) => arg.startsWith('--only='));
  const values = option
    ? option.slice('--only='.length).split(',').map((value) => value.trim()).filter(Boolean)
    : [];
  if (values.length === 0) return targets;

  const unknown = values.filter((value) => !targets.some((target) => target.id === value));
  if (unknown.length) throw new Error(`Unknown target(s): ${unknown.join(', ')}. Choose claude, cursor, or codex.`);
  return targets.filter((target) => values.includes(target.id));
}

function parseAgent(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: expected YAML frontmatter`);

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-z][a-z0-9_-]*):\s*(.*)$/i);
    if (field) metadata[field[1]] = field[2].trim();
  }

  for (const required of ['name', 'description']) {
    if (!metadata[required]) throw new Error(`${filename}: missing ${required}`);
  }
  const skills = (metadata.skills ?? '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
  return { metadata, skills, body: match[2].trimStart() };
}

function roleInstructions({ skills, body }) {
  if (skills.length === 0) return body;
  return `${body.trimEnd()}\n\nLoad these installed skills when relevant to the assignment: ${skills.map((skill) => `\`${skill}\``).join(', ')}.\n`;
}

function renderCursor(agent) {
  const { metadata } = agent;
  const frontmatter = [
    `name: ${JSON.stringify(metadata.name)}`,
    `description: ${JSON.stringify(metadata.description)}`,
    `model: inherit`,
  ];
  return `---\n${frontmatter.join('\n')}\n---\n\n${roleInstructions(agent)}\n`;
}

function renderCodex(agent) {
  const { metadata } = agent;
  const lines = [
    `# ${managedMarker} Refresh with /setup.`,
    `name = ${JSON.stringify(metadata.name)}`,
    `description = ${JSON.stringify(metadata.description)}`,
  ];
  const effort = metadata.effort;
  if (['low', 'medium', 'high', 'xhigh'].includes(effort)) {
    lines.push(`model_reasoning_effort = ${JSON.stringify(effort)}`);
  }
  lines.push(`developer_instructions = ${JSON.stringify(roleInstructions(agent))}`);
  return `${lines.join('\n')}\n`;
}

async function main() {
  const selectedTargets = selectTargets();
  const files = (await readdir(sourceDir)).filter((file) => file.endsWith('.md')).sort();
  if (files.length === 0) throw new Error(`No agent Markdown files found in ${sourceDir}`);

  let installed = 0;
  let conflicts = 0;
  let failures = 0;

  for (const target of selectedTargets) {
    const targetDir = path.resolve(process.cwd(), target.dir);
    try {
      await mkdir(targetDir, { recursive: true });
    } catch (error) {
      console.error(`  ! could not create ${target.dir}: ${error.message}`);
      failures += files.length;
      continue;
    }

    const installedNames = new Set();
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const raw = await readFile(sourcePath, 'utf8');
      let rendered;
      try {
        const agent = parseAgent(raw, file);
        rendered = target.host === 'Claude Code'
          ? raw
          : target.host === 'Cursor'
            ? renderCursor(agent)
            : renderCodex(agent);
      } catch (error) {
        console.error(`  ! ${error.message}`);
        failures += 1;
        continue;
      }

      const outputName = `${path.basename(file, '.md')}${target.extension}`;
      const outputPath = path.join(targetDir, outputName);
      try {
        const existing = await readFile(outputPath, 'utf8').catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        if (existing !== null && !existing.includes(managedMarker)) {
          console.log(`  ! preserved existing custom agent: ${path.relative(process.cwd(), outputPath)}`);
          conflicts += 1;
          continue;
        }
        await writeFile(outputPath, rendered, 'utf8');
        installed += 1;
        installedNames.add(outputName);
      } catch (error) {
        console.error(`  ! could not install ${path.relative(process.cwd(), outputPath)}: ${error.message}`);
        failures += 1;
      }
    }

    // Remove old managed names only after their replacement is safely installed.
    for (const name of renamedAgents) {
      const newName = `${name}${target.extension}`;
      if (!installedNames.has(newName)) continue;

      const oldPath = path.join(targetDir, `sistemigro-${name}${target.extension}`);
      try {
        const existing = await readFile(oldPath, 'utf8').catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        if (existing === null) continue;
        if (!existing.includes(managedMarker)) {
          console.log(`  ! preserved legacy custom agent: ${path.relative(process.cwd(), oldPath)}`);
          conflicts += 1;
          continue;
        }
        await unlink(oldPath);
        console.log(`  removed renamed managed agent: ${path.relative(process.cwd(), oldPath)}`);
      } catch (error) {
        console.error(`  ! could not remove ${path.relative(process.cwd(), oldPath)}: ${error.message}`);
        failures += 1;
      }
    }
    console.log(`  ${target.host}: ${target.dir}/`);
  }

  const hostList = selectedTargets.map((target) => target.host).join(', ');
  console.log(`${installed} native agent file(s) installed for ${hostList}.`);
  if (conflicts > 0 || failures > 0) {
    if (conflicts > 0) console.error(`${conflicts} name conflict(s): rename the custom file or add the managed marker before refreshing.`);
    if (failures > 0) console.error(`${failures} agent file(s) could not be installed.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Agent installation failed: ${error.message}`);
  process.exitCode = 1;
});
