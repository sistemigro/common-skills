#!/usr/bin/env node
// Validates every skills/<name>/SKILL.md against the Agent Skills spec
// (https://agentskills.io) plus this repo's own conventions.
// No dependencies: run with `node scripts/validate-skills.mjs`.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_DESCRIPTION = 1024;

const errors = [];
const warnings = [];
const seen = new Map();

function parseFrontmatter(raw, where) {
  if (!raw.startsWith("---\n")) {
    errors.push(`${where}: missing YAML frontmatter (file must start with "---")`);
    return null;
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    errors.push(`${where}: frontmatter is never closed with "---"`);
    return null;
  }
  const fields = {};
  for (const line of raw.slice(4, end).split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (/^\s/.test(line)) continue; // nested keys (metadata:, allowed-tools lists)
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return { fields, body: raw.slice(end + 4).trim() };
}

let dirs;
try {
  dirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
} catch {
  console.error("No skills/ directory found at the repository root.");
  process.exit(1);
}

if (dirs.length === 0) {
  console.error("skills/ is empty: the CLI falls back to a recursive search and may pick up stray files.");
  process.exit(1);
}

for (const dir of dirs) {
  const where = `skills/${dir}/SKILL.md`;
  const file = join(skillsDir, dir, "SKILL.md");
  try {
    statSync(file);
  } catch {
    errors.push(`skills/${dir}: no SKILL.md (every skill directory needs one)`);
    continue;
  }

  const parsed = parseFrontmatter(readFileSync(file, "utf8"), where);
  if (!parsed) continue;
  const { fields, body } = parsed;

  const name = fields.name;
  if (!name) {
    errors.push(`${where}: frontmatter is missing required field "name"`);
  } else {
    if (!NAME_RE.test(name)) {
      errors.push(`${where}: name "${name}" must be lowercase kebab-case ([a-z0-9-])`);
    }
    if (name !== dir) {
      errors.push(`${where}: name "${name}" must match its directory name "${dir}"`);
    }
    if (seen.has(name)) {
      errors.push(`${where}: duplicate name "${name}", already used by ${seen.get(name)}`);
    } else {
      seen.set(name, where);
    }
  }

  const description = fields.description;
  if (!description) {
    errors.push(`${where}: frontmatter is missing required field "description"`);
  } else if (description.length > MAX_DESCRIPTION) {
    errors.push(`${where}: description is ${description.length} chars (max ${MAX_DESCRIPTION})`);
  } else if (description.length < 40) {
    warnings.push(`${where}: description is very short — say what it does AND when to use it`);
  }

  if (body.length < 50) {
    warnings.push(`${where}: body is nearly empty, the agent has nothing to follow`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s) in ${dirs.length} skill(s).`);
  process.exit(1);
}
console.log(`${dirs.length} skill(s) valid: ${[...seen.keys()].join(", ")}`);
