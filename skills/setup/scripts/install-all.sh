#!/usr/bin/env bash
# Install the configured skills and agents, then initialize Playwright.
#
# Usage: install-all.sh [list-file]
#   list-file defaults to skills.txt next to the setup skill.
set -uo pipefail

main() {
  local here list skills_status playwright_status
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  list="${1:-$here/../skills.txt}"

  echo "→ installing shared skills and native agents"
  if bash "$here/install-skills.sh" "$list"; then
    skills_status=0
  else
    skills_status=$?
    echo "✗ skills or agent installation reported failures" >&2
  fi

  echo "→ setting up Playwright"
  if bash "$here/install-playwright.sh"; then
    playwright_status=0
  else
    playwright_status=$?
    echo "✗ Playwright setup failed" >&2
  fi

  if [[ $skills_status -eq 0 && $playwright_status -eq 0 ]]; then
    echo "✓ project setup complete for Claude Code, Codex, and Cursor"
    return 0
  fi

  echo "Project setup finished with errors; fix the reported issues and rerun this command." >&2
  return 1
}

main "$@"
