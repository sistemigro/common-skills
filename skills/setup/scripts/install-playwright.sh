#!/usr/bin/env bash
# Make the Playwright Agent CLI available in the current project.
#   https://playwright.dev/agent-cli/installation
#
# Creates .playwright/ (and adds it to .gitignore), downloads any missing
# browsers, and writes the CLI's own workflow docs to both .agents/skills and
# .claude/skills. Codex and Cursor discover the shared .agents copy.
#
# Usage: install-playwright.sh    — run from the project root.
set -uo pipefail

need=20
have="$(node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/')"
if [[ -z "$have" ]]; then
  echo "✗ Node is not installed; Playwright Agent CLI needs Node $need or newer." >&2
  exit 1
fi
if (( have < need )); then
  echo "✗ Node $have is too old; Playwright Agent CLI needs Node $need or newer." >&2
  exit 1
fi

if command -v playwright-cli >/dev/null 2>&1; then
  echo "→ playwright-cli $(playwright-cli --version 2>/dev/null | head -1) already installed"
  run=(playwright-cli)
else
  echo "→ installing @playwright/cli globally"
  if npm install -g @playwright/cli@latest >/dev/null 2>&1; then
    run=(playwright-cli)
  else
    echo "  global install failed, falling back to npx"
    run=(npx -y @playwright/cli@latest)
  fi
fi

# Writes .playwright/, the .gitignore entry and both native skill locations,
# and pulls any missing browsers.
echo "→ initialising workspace in $PWD"
if "${run[@]}" install --skills=agents </dev/null; then
  if "${run[@]}" install --skills=claude </dev/null; then
    echo "✓ Playwright Agent CLI ready for Claude Code, Codex, and Cursor"
  else
    echo "✗ playwright-cli could not install its Claude Code skill" >&2
    exit 1
  fi
else
  echo "✗ playwright-cli install failed" >&2
  exit 1
fi
