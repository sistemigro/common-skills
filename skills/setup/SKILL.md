---
name: setup
description: Install or refresh all of Iulian's standard agent skills into the current project from the shared skills.txt list, and set up the Playwright Agent CLI. Use only when explicitly asked to set up, install, refresh or bootstrap skills or a project.
disable-model-invocation: true
allowed-tools: Bash(bash:*), Bash(npx:*)
---

# Setup

Installs every source listed in this skill's `skills.txt` for Claude Code,
Codex, and Cursor, renders the bundled agents into each host's native format,
adds prompt-based agent routing to project instructions, then sets up the
Playwright Agent CLI for the project.

## Steps

1. Confirm the working directory is the project root, locate this skill's
   installer, and run the single setup script:

   ```bash
   for d in "${CLAUDE_PLUGIN_ROOT:-}" ./.agents/skills/setup ./.claude/skills/setup ./.codex/skills/setup ./.cursor/skills/setup "$HOME/.agents/skills/setup" "$HOME/.claude/skills/setup" "$HOME/.codex/skills/setup" "$HOME/.cursor/skills/setup"; do
     [ -f "$d/scripts/install-all.sh" ] && SKILL_DIR="$d" && break
   done
   bash "$SKILL_DIR/scripts/install-all.sh" "$SKILL_DIR/skills.txt"
   ```

   The loop is needed because `CLAUDE_PLUGIN_ROOT` is only set when this skill
   came from a plugin. The script installs the listed skills and native agents,
   then creates `.playwright/`, writes the CLI's skill docs to
   `.agents/skills/playwright-cli` (Codex and Cursor) and
   `.claude/skills/playwright-cli` (Claude Code), and downloads missing
   browsers. Playwright setup needs Node 20+.

2. Report the result: which sources installed, which failed, the final
   `N installed, N failed` line, the number of shared agents installed or any
   agent name conflicts, whether `AGENTS.md` and `CLAUDE.md` routing instructions
   were added or refreshed, and whether Playwright is ready.

3. For each failure, show the captured error output for that source and suggest a
   concrete fix — usually a typo in the `owner/repo` shorthand, a private
   repository needing `gh auth login`, or a `--skill` name absent from that
   source (check with `npx skills add <source> --list`).

4. Tell the user to start a new session so the newly installed skills are loaded.

## Notes

- Installs are project scoped. Codex and Cursor discover skills in
  `./.agents/skills/`; Claude Code discovers skills in `./.claude/skills/`.
- Shared agents are rendered into `./.claude/agents/` (Claude Code Markdown),
  `./.cursor/agents/` (Cursor Markdown), and `./.codex/agents/` (Codex TOML).
  Setup refreshes files managed by this repository and preserves same-name
  custom agents, reporting conflicts so they can be resolved explicitly.
- Setup adds a managed agent-routing section to the project's `AGENTS.md` and
  `CLAUDE.md`. It preserves other instructions in those files and refreshes only
  its own marked section. Those always-loaded instructions tell the host to
  select the suitable agent from the user's prompt without requiring the user
  to name an agent or invoke a skill.
- Codex custom agents inherit the parent session's available skills. Their
  instructions identify the role skills they should use; the shared skills
  remain discoverable from `./.agents/skills/`.
- Restart or open a new session in each tool after setup so it discovers the
  new skills and agents. Codex multi-agent support is enabled by default; if
  the project or user Codex config disables it, set `agents.enabled = true`.
