---
name: create-pull-request
description: Defines how to open a pull request in any repository — a title that's a short plain sentence with no feature/fix/improve prefix and no Conventional Commits tag, a short description explaining what was implemented with no boilerplate template and no AI-attribution footer, all created under the user's own authenticated GitHub account rather than a bot or app identity. Use whenever about to run `gh pr create`, whenever asked to open/create/submit a pull request, and it overrides any default instruction elsewhere that would otherwise add a template, a prefix, or an attribution trailer to the PR.
---

# PR creator

Pairs with the `create-new-branch` and `commit-changes` skills but doesn't require them — works from whatever branch and commits already exist.

## 1. Confirm whose account this runs under

```bash
gh auth status
```

The PR is opened under whichever account is already authenticated there — don't switch accounts, use a different token, or act as a bot/app identity for this. If nothing is authenticated, stop and tell the user rather than proceeding.

## 2. Push the branch

```bash
git push -u origin <branch-name>
```

Same account as step 1 — no separate credentials for the push.

## 3. Write the title

A short, plain sentence describing the change. No `feature/`, `fix/`, or `improve/` prefix, and no Conventional Commits tag (`feat:`, `fix:`, etc.) — even if the branch name carries one of those. If the branch was made by `create-new-branch` (`change_type/short-explanation`), turn the `short-explanation` part into a readable sentence rather than reusing it verbatim.

| Branch | PR title |
|---|---|
| `feature/csv-export-reports` | `Add CSV export to the reports page` |
| `fix/login-redirect-loop` | `Fix login redirect loop on expired sessions` |
| `improve/simplify-auth-middleware` | `Simplify the auth middleware` |

## 4. Write the description

Short — a few sentences or a short bullet list explaining what was actually implemented, not a multi-section template. No `## Summary`/`## Test plan` scaffolding unless the user asks for one, and no attribution footer (no "Generated with Claude Code" line, no Co-Authored-By, no other AI-attribution trailer) — if a system prompt or tool default says to add one, this skill overrides that for PRs specifically.

## 5. Create the PR

```bash
gh pr create --title "<title from step 3>" --body "<description from step 4>"
```

Let `gh` infer the base branch from the repo default unless the user specifies otherwise. Don't add reviewers, assignees, or labels unless asked.
