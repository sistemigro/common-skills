#!/usr/bin/env bash
# Install or refresh skills listed in a skills.txt-style list, plus native
# Claude Code, Codex, and Cursor agent definitions.
#
# Usage: install-skills.sh [list-file]
#   list-file defaults to skills.txt next to this script's skill directory.
#
# Installs at project scope. Claude Code uses .claude/skills; Codex and Cursor
# use .agents/skills. Run it from the project root.
#
# The whole body lives in main() on purpose: the list includes this repository,
# so a run can overwrite this very file. Bash reads a script incrementally, but
# it must parse all of main() before executing anything, so the file is fully
# read by the time the first install starts.
set -uo pipefail

log=""

main() {
  local here LIST ok failed line repo skills s agent_status
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  LIST="${1:-$here/../skills.txt}"

  if [[ ! -f "$LIST" ]]; then
    echo "No skill list found at: $LIST" >&2
    return 2
  fi

  log="$(mktemp "${TMPDIR:-/tmp}/install-skills.XXXXXX")"
  trap 'rm -f "$log"' EXIT

  ok=0
  failed=0
  agent_status=0

  # `|| [[ -n "$line" ]]` keeps a final line that has no trailing newline.
  while read -r line || [[ -n "${line:-}" ]]; do
    line="${line%$'\r'}"
    line="${line%%|*}"          # drop the "| why it is here" half
    [[ -z "${line// }" || "$line" == \#* ]] && continue
    read -r repo skills <<<"$line"

    local -a args=(add "$repo" -a claude-code -a codex -a cursor -y)
    if [[ -n "${skills:-}" ]]; then
      for s in $skills; do args+=(--skill "$s"); done
    else
      args+=(--skill '*')
    fi

    echo "→ $repo"
    # </dev/null matters: npx would otherwise consume the rest of the list.
    if npx -y skills "${args[@]}" </dev/null >"$log" 2>&1; then
      echo "  ✓"
      ok=$((ok + 1))
    else
      echo "  ✗ failed"
      print_log "$log"
      failed=$((failed + 1))
    fi
  done <"$LIST"

  if ! bash "$here/install-agents.sh"; then
    agent_status=1
  fi

  if [[ $((ok + failed)) -eq 0 ]]; then
    echo "Nothing to do: $LIST has no entries."
    return 0
  fi

  echo
  echo "$ok installed, $failed failed (Claude Code, Codex, Cursor; project: $PWD)"
  [[ $failed -eq 0 && $agent_status -eq 0 ]]
}

# The CLI draws animated spinners, so the captured log is full of escape codes
# and redrawn frames. Strip them down to the lines a human can act on.
print_log() {
  tr '\r' '\n' <"$1" |
    sed -E $'s/\033\\[[0-9;?]*[a-zA-Z]//g' |
    sed -E 's/^[[:space:]]*(│|┌|└|├|■|◆|◇|◒|◐|◓|◑|●|○)+[[:space:]]*//' |
    grep -v -E '^[[:space:]]*$' |
    grep -v -i -E 'cloning repository|^canceled$' |
    awk '!seen[$0]++' |
    tail -n 15 |
    sed 's/^/    /'
}

main "$@"
