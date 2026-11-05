#!/usr/bin/env node
// Regenerates the installed-skills table in README.md from
// skills/setup/skills.txt, so the two can never drift.
//
//   node scripts/sync-readme.mjs           rewrite the table
//   node scripts/sync-readme.mjs --check   fail if the table is out of date (CI)

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const listPath = join(root, "skills/setup/skills.txt");
const readmePath = join(root, "README.md");

const START = "<!-- skills-table:start -->";
const END = "<!-- skills-table:end -->";
const TOPICS = new Set(["design", "code-quality", "security", "marketing", "planning"]);

const rows = [];
const problems = [];

readFileSync(listPath, "utf8").split("\n").forEach((raw, i) => {
  const line = raw.replace(/\r$/, "").trim();
  if (!line || line.startsWith("#")) return;

  const [rawEntry = "", rawWhy = "", rawTopics = ""] = line.split("|");
  const entry = rawEntry.trim();
  const why = rawWhy.trim();
  const topics = rawTopics.split(",").map((topic) => topic.trim()).filter(Boolean);
  if (!entry) return;

  const [source, ...skills] = entry.split(/\s+/);
  if (!why) problems.push(`skills.txt:${i + 1}: "${source}" has no "| why it is here"`);
  if (topics.length === 0) problems.push(`skills.txt:${i + 1}: "${source}" has no topics`);
  for (const topic of topics) {
    if (!TOPICS.has(topic)) problems.push(`skills.txt:${i + 1}: "${source}" has unknown topic "${topic}"`);
  }

  const href = /^[\w.-]+\/[\w.-]+$/.test(source)
    ? `https://github.com/${source}`
    : /^https?:\/\//.test(source)
      ? source
      : null;

  rows.push({
    source: href ? `[\`${source}\`](${href})` : `\`${source}\``,
    skills: skills.length ? skills.map((s) => `\`${s}\``).join(", ") : "all",
    topics: topics.join(", "),
    why: why.replace(/\|/g, "\\|"),
  });
});

if (problems.length) {
  for (const p of problems) console.error(`error ${p}`);
  process.exit(1);
}

const table = [
  "| Source | Skills | Topics | Why it is here |",
  "| --- | --- | --- | --- |",
  ...rows.map((r) => `| ${r.source} | ${r.skills} | ${r.topics} | ${r.why} |`),
].join("\n");

const readme = readFileSync(readmePath, "utf8");
const from = readme.indexOf(START);
const to = readme.indexOf(END);
if (from === -1 || to === -1) {
  console.error(`README.md is missing the ${START} / ${END} markers.`);
  process.exit(1);
}

const updated =
  readme.slice(0, from + START.length) + "\n\n" + table + "\n\n" + readme.slice(to);

if (updated === readme) {
  console.log(`README table up to date (${rows.length} sources).`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  console.error("README table is out of date. Run: node scripts/sync-readme.mjs");
  process.exit(1);
}

writeFileSync(readmePath, updated);
console.log(`README table updated (${rows.length} sources).`);
