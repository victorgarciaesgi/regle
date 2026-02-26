# Documentation Rules

Apply these rules whenever updating documentation.

## Core requirements

- Any documentation change must be reflected in the `skills/` content when relevant (API, workflow, best practices, constraints).
- After every documentation change, run a build check (`pnpm run docs:build` at minimum).
- Do not use `twoslash` unless it is necessary to demonstrate type inference or type errors.
- Include an example component when the feature has meaningful UI behavior (operators, state visualization, interactive flows).

## Style and structure

- Keep page frontmatter complete and accurate (`title`, `description`).
- Prefer practical examples that compile and match current public APIs.
- Use `code-group` when showing multi-file flows (store + component, composable + usage).
- For interactive docs pages, include a `Result` section with the demo component.
- Keep examples concise, but include SSR/Pinia caveats when relevant (e.g., hydration constraints).

## Quality checks

- Verify docs examples do not drift from source behavior and tests.
- If documentation introduces or changes a documented workflow, ensure related docs sections stay consistent (core docs, integrations, and skills).
