# Sistemigro Common Skills

Shared [Agent Skills](https://agentskills.io) for Sistemigro projects, plus a
`setup` skill that installs every skill we standardise on, in one pass.

Everything installs at **project scope**, into the project's `.claude/skills/`,
so skills are committed alongside the project that uses them.

## Install all skills into a project

From the project root:

```bash
npx skills add sistemigro/common-skills --skill setup
bash .claude/skills/setup/scripts/install-skills.sh
bash .claude/skills/setup/scripts/install-playwright.sh
```

The first line installs the `setup` skill. The second pulls in every source
listed in `skills.txt` — see [What gets installed](#what-gets-installed) — and
that list includes this repository, so it also refreshes `setup` itself. The
third makes the [Playwright Agent CLI](https://playwright.dev/agent-cli/installation)
available for browser automation and testing (needs Node 20+). Re-run the last
two any time.

Then start a new session so the agent loads the new skills.

This repository is **private**, so the machine needs access to the `sistemigro`
org first — an authenticated `gh` (`gh auth login`), a git credential helper, or
a working SSH key. The CLI tries all three.

## Using the setup skill

Once installed, invoke it by name in Claude Code:

```
/setup
```

It installs every source in the list, reports `N installed, N failed`, prints the
error for each failure, and exits non-zero if anything failed. It never runs on
its own — `disable-model-invocation: true` means it only fires when you ask.

To target another agent:

```bash
AGENT=codex bash .claude/skills/setup/scripts/install-skills.sh
```

## Changing what gets installed

Edit `skills/setup/skills.txt` in this repository — one source per line,
optionally followed by specific skill names:

```
# <source> [skill ...] | <why it is here>
Leonxlnx/taste-skill | Frontend design taste.
vercel-labs/agent-skills  web-design-guidelines  frontend-design | Just these two.
```

A source with no skill names installs all of its skills. The `| why` half is
required and feeds the table below. Blank lines and `#` comments are ignored.
Sources can be `owner/repo`, any git URL, or a local path.

Then regenerate the table and push:

```bash
node scripts/sync-readme.mjs
```

Re-run `/setup` wherever you want the change.

## What gets installed

<!-- skills-table:start -->

| Source | Skills | Why it is here |
| --- | --- | --- |
| [`sistemigro/common-skills`](https://github.com/sistemigro/common-skills) | all | Our own skills: the git workflow (`commit-changes`, `create-new-branch`, `create-pull-request`), the house rules (`design-anti-patterns`, `nextjs-ssr`), and `setup` itself, so every run also refreshes this list and the installer. |
| [`anthropics/skills`](https://github.com/anthropics/skills) | `frontend-design`, `docx`, `pptx`, `xlsx`, `pdf`, `skill-creator`, `webapp-testing`, `web-artifacts-builder` | `frontend-design` is the primary design skill: brief-first, no hardcoded aesthetic, and the one other repos fork. Plus document formats and skill authoring. |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) | `design-taste-frontend`, `image-to-code` | Landing-page and portfolio specialist, explicitly contextual rather than a fixed style. `image-to-code` turns a reference image into markup. |
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max`, `design-system` | Lookup library: 192 palettes, 74 font pairings, 119 UX guidelines, 22 stacks. Reference data, not a competing opinion. |
| [`bencium/bencium-claude-code-design-skill`](https://github.com/bencium/bencium-claude-code-design-skill) | `design-audit`, `ui-typography`, `eu-ai-act-reviewer` | Review passes: design critique, typography checks, and EU AI Act compliance for EU clients. |
| [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills) | `web-design-guidelines`, `deploy-to-vercel`, `vercel-react-best-practices`, `writing-guidelines` | Review UI against the live Web Interface Guidelines, deploy, and React/writing practice. |
| [`accesslint/claude-marketplace`](https://github.com/accesslint/claude-marketplace) | all | Accessibility: scan, audit, inspect, diff and fix a11y issues before client sites ship. |
| [`cloudflare/security-audit-skill`](https://github.com/cloudflare/security-audit-skill) | all | Security audit of code before client work goes live. |
| [`SNLabat/SEO-GEO-AEO-Skill`](https://github.com/SNLabat/SEO-GEO-AEO-Skill) | all | SEO, GEO and AEO audits of client sites: search rankings, schema markup, and visibility in AI answer engines. |

<!-- skills-table:end -->
