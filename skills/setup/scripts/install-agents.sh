#!/usr/bin/env bash
# Render and install bundled agents in each host's native project format.
# Optional: pass --only=claude,cursor or --only=codex to target specific hosts.
set -uo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
status=0
node "$here/render-agents.mjs" "$@" || status=1
node "$here/install-agent-routing.mjs" || status=1
exit "$status"
