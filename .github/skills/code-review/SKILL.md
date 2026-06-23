---
name: code-review
description: >-
  Mandatory pre-commit validation for every Copilot code review on pull requests
  in the regle monorepo. Always verify commitlint compliance on commit titles and
  descriptions, pnpm workspace install, lint (vp lint), and format (vp fmt
  --check). Loaded on every code review — do not skip.
---

# Code review — pre-commit validation

**Apply on every pull request review.** These checks are blocking. Do not approve a PR until all pass or the author has addressed failures.

## Review checklist (run every time)

| # | Gate | Command | On failure |
|---|------|---------|------------|
| 1 | Commit messages | `printf '%s' "$MSG" \| pnpm exec commitlint` per commit | Blocking comment + suggested fix |
| 2 | Workspace | `test -f node_modules/.modules.yaml` | Request `pnpm install` |
| 3 | Lint | `pnpm run lint` | Blocking; suggest `pnpm run lint:fix` |
| 4 | Format | `pnpm run fmt:check` | Blocking; suggest `pnpm run fmt` |

Run all commands from the repo root after `pnpm install`.

## Commit messages (commitlint)

Every commit must follow [Conventional Commits](https://www.conventionalcommits.org/) per `commitlint.config.ts` (`@commitlint/config-conventional`).

```
type(optional-scope): imperative subject

Optional body explaining why.
```

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
- Subject: lowercase, imperative mood, no trailing period
- Blank line between title and body when a body is present

## Auto-fix loop

```bash
pnpm run lint:fix
pnpm run fmt
pnpm run lint
pnpm run fmt:check
```

## Common commitlint failures

| Error | Fix |
|-------|-----|
| `type-empty` / `subject-empty` | Use `type: subject` format |
| `type-enum` | Use an allowed conventional type |
| `subject-case` | Keep subject lowercase |
| `subject-full-stop` | Remove trailing `.` from subject |
