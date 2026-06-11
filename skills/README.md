# Regle Agent Skills

Reusable [Agent Skills](https://skills.sh/) for [Regle](https://regle.dev/) — a type-safe, headless form validation library for Vue.js.

## Install

```sh
npx skills add victorgarciaesgi/regle
```

## Available Skills

| Skill | Description |
|-------|-------------|
| **regle** | Core usage — `useRegle`, the `r$` object, validation properties, displaying errors, modifiers |
| **regle-rules** | Validation rules — built-in rules, custom rules (`createRule`), rule wrappers (`withMessage`, `withParams`, `withAsync`), rule operators (`and`, `or`, `applyIf`, `assignIf`) |
| **regle-advanced** | Advanced patterns — collections, async validation, server errors, reset, global config, variants, scoped validation, merge, `$self` |
| **regle-schemas** | Schema integration — `useRegleSchema` with Zod, Valibot, ArkType, and Standard Schema |
| **regle-typescript** | TypeScript integration — type-safe output, typing rules schemas, typing component props |
| **regle-migrate-vuelidate** | Migration guide — port Vuelidate forms (`useVuelidate`) to Regle (`useRegle`/`useScopedRegle`) |

## Compatibility

These skills work with any agent that supports the [Agent Skills](https://skill.md/) spec, including Cursor, Claude Code, Windsurf, GitHub Copilot, Cline, and more.
