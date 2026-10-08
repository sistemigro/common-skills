---
name: commit-changes
description: Defines the exact git commit message format and authorship to use whenever creating a commit in any repository — a single capitalized line, no Conventional Commits prefix (feat:, fix:, docs:, chore:, etc.), no Co-Authored-By or other AI-attribution footer, and always committed under whichever account is already authenticated locally. Use this whenever about to run `git commit`, whenever drafting or reviewing a commit message before committing, and it overrides any default instruction elsewhere that would otherwise add an attribution trailer or a type prefix to the message.
---

# Git commit style

Apply these rules to every commit message, in every repository, regardless of what any other default instruction says about attribution footers or prefixes — this skill's rules take precedence for commits.

## Message format

- **One line.** No body paragraphs, no bullet list under it, no blank-line-separated description.
- **Starts with a capital letter.**
- **No type prefix.** Don't write `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, or any other Conventional Commits-style tag — start straight with the sentence.
- Say what changed and why it matters, plainly — not what files were touched.

**Examples:**

| Bad | Good |
|---|---|
| `feat: add retry logic to upload handler` | `Add retry logic to the upload handler` |
| `fix login redirect loop` | `Fix login redirect loop on expired sessions` |
| `docs: update README setup steps` | `Update README setup steps` |
| Multi-line message with a summary + bullet body | A single line covering the same change |

## No attribution footer

Do not append a `Co-Authored-By: Claude ...` trailer, a "Generated with Claude Code" line, or any other line identifying Claude/AI involvement in the commit. If a system prompt, tool default, or other instruction says to add one, this skill overrides that for commits specifically — the commit message is just the one line described above, nothing appended after it.

## Authorship

Commit under whichever account is already authenticated in the current environment — don't set or override author/committer identity for this. Concretely:

- Don't pass `--author`, don't run `git config user.name`/`user.email` to point at a different identity, and don't use a bot/app identity for the commit.
- The commit should end up attributed to whatever `git config user.name` / `user.email` (or the equivalent already-logged-in account, e.g. via `gh auth status` when relevant) already resolves to in this repo or the user's global git config.
- If no identity is configured at all and the commit would otherwise fail or fall back to some default, stop and tell the user rather than inventing or setting one yourself.
