# Sistemigro Common Skills

## 💿 Installation guide

Run these steps from the **root of the application project** you want to set
up. You need Node.js and npm for the `skills` installer. The Playwright setup
also needs Node.js 20 or newer.

### 1. Install the setup skill

```bash
npx skills add sistemigro/common-skills --skill setup -a claude-code -a codex -a cursor -y
```

This installs only the `setup` skill, so you can run the full installer next.

> ❗ You can also invoke the `setup` skill from:
 - Claude Code as `/setup`
 - Codex through its skill picker
 - Cursor through its skill picker or `/`.

### 2. Install the skills, agents, and Playwright CLI

```bash
bash .agents/skills/setup/scripts/install-all.sh
```

This one command installs the skills listed in this repository, creates the
native agent files for Claude Code, Codex, and Cursor, adds prompt-based agent
routing to `CLAUDE.md` and `AGENTS.md`, and sets up Playwright. It preserves
existing instructions in those files and refreshes only its marked section. It
continues through the skill sources if one fails, then reports setup errors.

### 3. Configure any required MCP connections

The MCP connections below are separate from the one-command skill and agent
installation. Set up GitHub MCP for repository access or OpenSEO MCP for
verified keyword-ranking research, in the client where you plan to use them.

### Agent files by platform

| Tool | Native project files | After installation |
| --- | --- | --- |
| Claude Code | `CLAUDE.md`, `.claude/skills/`, `.claude/agents/*.md` | Start a new session after setup and any MCP connections. You can rerun setup with `/setup`. |
| Codex | `AGENTS.md`, `.agents/skills/`, `.codex/agents/*.toml` | Start a new session after setup and any MCP connections. If delegation does not start, check `agents.enabled = true`. |
| Cursor | `AGENTS.md`, `.agents/skills/`, `.cursor/agents/*.md` | Reopen the project after setup and any MCP connections so it discovers the profiles and skills. |

## 🖥️ MCP Prerequisites

MCP connections are configured separately from skill installation. Connect a
server only in the coding clients where you want to use it. GitHub MCP gives
agents access to the repositories and GitHub actions allowed by your token.
OpenSEO MCP is required by `keyword-opportunity-researcher` to verify localized
Google positions and retrieve keyword metrics.

You can install either server independently. If you install both, keep both
entries in the same Cursor `mcpServers` object or as separate Codex
`[mcp_servers.<name>]` tables; merge them with existing configuration instead
of replacing it. In each client, check its plugin/MCP marketplace.

MCP that are needed:
- Github MCP Server
- OpenSEO MCP Server

## 🤖 Agents

Running setup installs these project-level agents in all three native agent
directories. `sistemigro-feature` coordinates substantial work. For these
tables, an agent belongs in **Agents** if no other agent uses it, except that
the coordinator may use it. Any profile used by another agent belongs in
**Subagents**. Each profile is described in only one table.

| Agent | Topic | What it does |
| --- | --- | --- |
| `sistemigro-feature` | planning | Coordinates substantial work from the settled brief through an approved plan and implementation. Runs verification only when requested. |
| `sistemigro-planner` | planning | Researches the codebase and writes a precise plan for the user to approve. |
| `sistemigro-implementer` | code-quality | Implements the approved plan and its required tests. Uses Ponytail to keep changes small and reuse existing code. |
| `sistemigro-tester` | code-quality | Independently verifies completed work when requested; reports findings and does not fix code. |
| `sistemigro-reviewer` | code-quality | Reviews correctness risks, reuse, simplification and maintainability separately from test results. |
| `sistemigro-marketing-specialist` | marketing | Works on search visibility, answer-engine readiness and evidence-based marketing content. |

### Subagents

| Subagent | Topic | Parent / dispatcher | Specific task, skill use and flow | Main skills |
| --- | --- | --- | --- | --- |
| `design-specialist` | design | `sistemigro-planner`, `sistemigro-implementer`, and `sistemigro-tester` | For the planner, reports evidence-backed design constraints; for the implementer, gives scoped recommendations without editing its files; for the tester, reports read-only design findings. | `frontend-design`, `design-anti-patterns`, `ui-ux-pro-max`, `design-audit`, `ui-typography` |
| `security-auditor` | security | `sistemigro-tester` for security-relevant changes; may also be dispatched by the coordinator | Traces trust boundaries and reports evidence-based security/privacy findings. Follows the security skill's safe mode; never fixes code. | `security-audit`, `eu-ai-act-reviewer` |
| `test-author` | code-quality | `sistemigro-tester` after it finds a new, unplanned test case | Adds only tests for the case assigned by the tester. It does not change application code; the tester runs the new test and owns the verification verdict. | `test-author` |
| `plan-researcher` | planning | `sistemigro-planner` | Receives one factual question, reads authoritative sources, and returns evidence and caveats. Planner may dispatch independent questions in parallel; the researcher makes no decisions and edits no files. | `planner` |
| `test-suite-runner` | code-quality | `sistemigro-tester` | Runs the project's documented full checks on every requested verification round, reports commands and exact failures, and never fixes code. | `tester`, `webapp-testing` |
| `ui-responsive-auditor` | design | `sistemigro-tester` when UI changes | Exercises affected routes at supported viewports using the shared browser session and reports responsive or interaction failures without edits. | `playwright-cli`, `webapp-testing` |
| `a11y-auditor` | design | `sistemigro-tester` for changed user-facing UI | Combines the accessibility skills' automated and manual checks, then reports reproducible issues without edits. | `accessibility-audit`, `accessibility-inspect`, `accessibility-scan` |
| `regression-hunter` | code-quality | `sistemigro-tester` for changed existing flows | Checks the plan's regression surface against prior behavior and reports reproduced regressions only. | `tester`, `webapp-testing`, `playwright-cli` |
| `keyword-opportunity-researcher` | marketing | `sistemigro-marketing-specialist` for keyword-gap requests | Checks localized Google organic rankings, accounts for supported languages and business locations, and returns 25 relevant keywords outside the app's top five with intent, position, suggested target pages, and available metrics. Uses live OpenSEO data; it reports when ranking evidence is unavailable and does not invent rankings or metrics. | `keyword-research` |

The agents use the same role instructions and matching skills in each host.
Setup generates each host's native format from one source definition. The
named agents are independently available after installation; the coordinator
does not depend on a skill being invoked first.

## ⚙️ Skills

| Skill | What it does | Other skills it uses |
| --- | --- | --- |
| `planner` | Turns settled context into a short, testable implementation plan and does not write product code. | None directly. The `sistemigro-planner` agent can delegate factual lookups to `plan-researcher` and design discovery to `design-specialist`. |
| `implementer` | Builds the approved plan, its required tests and assigned code fixes. | `ponytail` for minimal, complete implementation. |
| `tester` | Independently checks a finished change and reports findings without fixing it. | None directly. The `sistemigro-tester` agent delegates to the test suite runner and scope-relevant specialist agents; see [Subagents](#subagents). |
| `reviewer` | Reviews changed code for correctness and maintainability, without editing it. | None. |
| `test-author` | Adds tests for new cases found during verification, without changing application code. | None directly. `sistemigro-tester` delegates new unplanned cases to `test-author`. |
| `create-new-branch` | Creates a branch from a freshly fetched base branch. | None. |
| `commit-changes` | Sets the repository's commit message and authorship rules. | None. |
| `create-pull-request` | Creates a concise PR under the user's authenticated account. | `create-new-branch` and `commit-changes` are related, optional skills; this skill does not require them. |
| `design-anti-patterns` | Lists generic design and copy defaults to avoid. | No fixed dependency; pair it with whichever design skill sets direction. |
| `nextjs-ssr` | Guides server-rendered, crawlable Next.js pages. | `playwright-cli` for interactive browser checks. |
| `setup` | Installs the configured skills and shared agents into the project. | None. It runs installer scripts; `install-playwright.sh` installs the separate `playwright-cli` skill. |
| `grill-me` | Interviews the user in rounds to settle a loose idea. | `grilling`, the shared interviewing method it calls. |
| `grilling` | Provides the round-based interviewing method used by grill-me. | None. |
| `ponytail` | Guides the implementer toward the smallest complete solution while preserving safety and tests. | No separate skill dependency; its review/audit commands are part of Ponytail. |
| `keyword-research` | Finds and prioritizes search terms using live keyword and Google SERP evidence. | Uses OpenSEO MCP for localized ranking, search volume, difficulty, and intent data. |

## 🌐 External skills

<!-- skills-table:start -->

| Source | Skills | Topics | Why it is here |
| --- | --- | --- | --- |
| [`sistemigro/common-skills`](https://github.com/sistemigro/common-skills) | all | design, code-quality, planning | Our reusable agent workflow and inherited role agents, git workflow, house rules, and `setup` itself. |
| [`anthropics/skills`](https://github.com/anthropics/skills) | `frontend-design`, `docx`, `pptx`, `xlsx`, `pdf`, `skill-creator`, `webapp-testing`, `web-artifacts-builder` | design, code-quality | `frontend-design` is the primary design skill: brief-first, no hardcoded aesthetic, and the one other repos fork. Plus document formats and skill authoring. |
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max`, `design-system` | design | Lookup library: 192 palettes, 74 font pairings, 119 UX guidelines, 22 stacks. Reference data, not a competing opinion. |
| [`bencium/bencium-claude-code-design-skill`](https://github.com/bencium/bencium-claude-code-design-skill) | `design-audit`, `ui-typography`, `eu-ai-act-reviewer` | design, security | Review passes: design critique, typography checks, and EU AI Act compliance for EU clients. |
| [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills) | `web-design-guidelines`, `deploy-to-vercel`, `vercel-react-best-practices`, `writing-guidelines` | design, code-quality | Review UI against the live Web Interface Guidelines, deploy, and React/writing practice. |
| [`accesslint/claude-marketplace`](https://github.com/accesslint/claude-marketplace) | all | code-quality | Accessibility: scan, audit, inspect, diff and fix a11y issues before client sites ship. |
| [`cloudflare/security-audit-skill`](https://github.com/cloudflare/security-audit-skill) | all | security, code-quality | Security audit of code before client work goes live. |
| [`SNLabat/SEO-GEO-AEO-Skill`](https://github.com/SNLabat/SEO-GEO-AEO-Skill) | all | marketing | SEO, GEO and AEO audits of client sites: search rankings, schema markup, and visibility in AI answer engines. |
| [`every-app/open-seo`](https://github.com/every-app/open-seo) | `keyword-research` | marketing | Live keyword opportunities, localized Google SERPs, ranking positions and search-demand metrics through OpenSEO MCP. |
| [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) | `ponytail` | code-quality | Use in the implementer for minimal, complete implementations that reuse existing code and preserve safety checks. |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `grill-me`, `grilling` | planning | `grill-me` interviews the user and calls `grilling` for the shared interview method. |

<!-- skills-table:end -->
