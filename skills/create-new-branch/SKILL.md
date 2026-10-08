---
name: create-new-branch
description: Creates a new git branch following the naming convention "change_type/short-explanation" (change_type is feature, fix, or improve), always branched from a freshly fetched copy of the base branch rather than a possibly-stale local one. Use whenever about to run `git checkout -b`/`git switch -c`, whenever starting new work that needs its own branch, or when asked to create/start/cut a branch for a feature, fix, or improvement.
---

# Branch creator

## 1. Determine the base branch

If the user names a branch to base the new one on, use that. Otherwise auto-detect the repo's default branch — don't assume `main`:

```bash
gh repo view --json defaultBranchRefName -q .defaultBranchRefName
# or, without gh:
git remote show origin | sed -n '/HEAD branch/s/.*: //p'
```

## 2. Fetch it fresh

Always fetch that specific branch from the remote before branching, so the new branch starts from what's actually on the remote, not whatever the local copy happens to be at:

```bash
git fetch origin <base-branch>
```

## 3. Pick the change_type

Exactly one of these three — don't invent others (no `chore`, `docs`, `refactor`, etc. as the type here, even though those are common elsewhere):

| change_type | Use for |
|---|---|
| `feature` | Adds a capability that didn't exist before |
| `fix` | Corrects broken/incorrect behavior — a bug |
| `improve` | Changes something that already works, for the better — refactor, performance, polish, docs — without being a new feature or a bug fix |

If it's genuinely ambiguous which of the three fits, ask rather than guessing — the type is the first thing anyone reading the branch name sees.

## 4. Write the short_explanation

Lowercase, hyphen-separated, a few words (roughly 2-5) that say what the branch does, not how or why. No ticket/issue numbers unless the user gives one to include.

**Examples:**

| Change | Branch |
|---|---|
| Add retry logic to the upload handler | `feature/upload-retry-logic` |
| Login redirect loops on expired sessions | `fix/login-redirect-loop` |
| Simplify the auth middleware | `improve/simplify-auth-middleware` |
| Add CSV export to the reports page | `feature/csv-export-reports` |

## 5. Create the branch

Branch directly off the fetched remote ref, not off whatever the local base branch currently points to:

```bash
git checkout -b <change_type>/<short-explanation> origin/<base-branch>
```

Confirm with `git branch --show-current` afterward. The branch is local only at this point — don't push it unless the user asks.
