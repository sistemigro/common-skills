---
name: feature
description: Run a substantive feature or product change through a disciplined agent workflow: settle the brief, approve a plan, implement from it, then verify only when requested. Use for multi-step work that benefits from distinct planning, implementation and review roles; skip for questions and contained edits.
---

# Feature workflow

Act as the orchestrator. Keep the user in the loop, and pass work between roles
through files so each role has a clear contract. Use the inherited
`sistemigro-planner`, `sistemigro-implementer`, `sistemigro-tester`, and
`sistemigro-reviewer` agents when available. Use
subagents with the matching role skill when the host supports delegation but
does not load custom agent definitions; otherwise perform each role in the main
session while preserving the same boundaries.

Follow the project's Git instructions. When a feature should be isolated on a
new branch, use the installed `create-new-branch` skill before implementation.

## 1. Capture the brief

Choose a short kebab-case feature slug and create `.work/<slug>/context.md` with
the user's request verbatim. Read the relevant project instructions and code
before deciding which questions matter.

## 2. Settle decisions

For a substantial or ambiguous request, invoke `grill-me` in the current
conversation before planning. Ask questions in rounds, grouped by dependency, and
continue until the remaining decisions are settled or explicitly recorded as
unresolved. Do not grill a contained change whose scope is already clear. Add
settled decisions to `context.md`.

## 3. Plan and get approval

Have a planner load the `planner` skill and write `.work/<slug>/plan.md`. It
researches the project, but does not write product code or tests. The plan must
contain:

- Goal and settled decisions
- Out of scope
- Ordered steps with exact files, observable completion conditions, and
  required tests
- Regression surface and security/privacy notes
- Unresolved questions, if any

Show the plan and unresolved questions to the user. Do not implement until the
user approves it. Revise the plan if they steer it.

## 4. Implement from the approved plan

Dispatch an implementer with the approved plan and project instructions. The
implementer must load and follow the `implementer` skill, which in turn requires
using `ponytail` while coding. It owns planned product changes and the plan's
required tests, writes progress to `.work/<slug>/impl-log.md`, and runs only the
checks needed for its changes. It does not redesign the plan, add scope, or run
the full verification pass. If the plan is contradictory or impossible, stop
and report the blockage instead of guessing.

## 5. Verify only when requested

After implementation, report what changed and hand off. Do not run a separate
verification round unless the user asks for verification or review. When asked,
dispatch a tester that follows the `tester` skill to run relevant full checks and
report findings; the tester does not fix code. Use a separate reviewer following
the `reviewer` skill for code quality when the scope warrants it. Route planned
code findings to the implementer. For newly discovered test cases, have the
tester delegate test-only work to `test-author`; the tester owns the
next verification. Re-verify targeted fixes, with at most three fix rounds
before escalating.

For work with a clear topic, use the inherited specialist within the approved
scope: `design-specialist` for visual design,
`sistemigro-reviewer` for an independent code-quality pass,
`security-auditor` for security/privacy work, and
`sistemigro-marketing-specialist` for search visibility or marketing content. A
specialist does not replace the implementer or the user's approval gate.

## Handoff rules

- User decisions and approved plan are the source of truth.
- Keep each role inside its ownership; no role grades its own fixes.
- Do not silently treat skipped checks as passes.
- Keep the implementation log and review reports under `.work/<slug>/`.
- Report anything noticed but left outside the plan.
