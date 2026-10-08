---
name: setup
description: Install or refresh all of Iulian's standard agent skills into the current project from the shared skills.txt list, and set up the Playwright Agent CLI. Use only when explicitly asked to set up, install, refresh or bootstrap skills or a project.
disable-model-invocation: true
allowed-tools: Bash(bash:*), Bash(npx:*)
---

# Setup

Installs every source listed in this skill's `skills.txt` into the current
project's `.claude/skills/` using the `skills` CLI, then sets up the Playwright
Agent CLI for the project.

## Steps

1. Confirm the working directory is the project root, then run exactly this:

   ```bash
   for d in "${CLAUDE_PLUGIN_ROOT:-}" ./.claude/skills/setup "$HOME/.claude/skills/setup"; do
     [ -f "$d/scripts/install-skills.sh" ] && SKILL_DIR="$d" && break
   done
   bash "$SKILL_DIR/scripts/install-skills.sh" "$SKILL_DIR/skills.txt"
   ```

   The loop is needed because `CLAUDE_PLUGIN_ROOT` is only set when this skill
   came from a plugin.

2. Then make the Playwright Agent CLI available in this project:

   ```bash
   bash "$SKILL_DIR/scripts/install-playwright.sh"
   ```

   It creates `.playwright/`, writes the CLI's own skill docs to
   `.claude/skills/playwright-cli`, and downloads any missing browsers. Needs
   Node 20+; it reports and exits non-zero if that is missing.

3. Report the result: which sources installed, which failed, the final
   `N installed, N failed` line, and whether Playwright is ready.

4. For each failure, show the captured error output for that source and suggest a
   concrete fix — usually a typo in the `owner/repo` shorthand, a private
   repository needing `gh auth login`, or a `--skill` name absent from that
   source (check with `npx skills add <source> --list`).

5. Tell the user to start a new session so the newly installed skills are loaded.

## Notes

- Installs are project scoped and land in `./.claude/skills/`, so they are
  committed with the project.
- To target another agent, prefix the command with `AGENT=codex` (or any agent
  the `skills` CLI supports).
