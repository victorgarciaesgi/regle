---
title: Agent Skills
description: Install Regle Agent Skills for your AI coding agent
---

# Agent Skills

[Agent Skills](https://skills.sh/) are reusable capabilities for AI coding agents. They provide procedural knowledge that helps agents write Regle validation code more effectively.

Regle provides six skills covering core usage, validation rules, advanced patterns, schema integration, TypeScript, and migrating from Vuelidate.

## Install

```bash
npx skills add victorgarciaesgi/regle
```

This installs all Regle skills and configures them for your AI agent.

## Available skills

### `regle`

Core Regle usage:

- `useRegle` composable (state, rules, `r$` object)
- Validation properties (`$invalid`, `$dirty`, `$error`, `$errors`, `$pending`)
- Displaying errors (`getErrors`, `flatErrors`)
- Modifiers (`autoDirty`, `lazy`, `silent`, `rewardEarly`, `validationGroups`)

### `regle-rules`

Validation rules:

- Built-in validation rules (`required`, `email`, `minLength`, etc.)
- Custom rules (`createRule`, inline rules, async rules)
- Rule wrappers (`withMessage`, `withParams`, `withAsync`, `withTooltip`)
- Rule operators (`and`, `or`, `xor`, `not`, `pipe`, `applyIf`, `assignIf`)

### `regle-advanced`

Advanced patterns:

- Collections (`$each`, array validation)
- Async validation (`$pending`, debouncing)
- Server errors (`externalErrors`, dot-path errors)
- Reset forms (`$reset` options)
- Global configuration (`defineRegleConfig`, i18n)
- Variants (`createVariant`, `narrowVariant`, discriminated unions)
- Scoped validation (`useScopedRegle`, `useCollectScope`)
- Merge multiple Regles (`mergeRegles`)
- Object self validation (`$self`)

### `regle-schemas`

Schema integration:

- Schema libraries (`useRegleSchema` with Zod, Valibot, ArkType)
- Standard Schema spec (`useRules`, `refineRules`, `InferInput`)

### `regle-typescript`

TypeScript integration:

- Type-safe output (`$validate` return type, `InferSafeOutput`)
- Typing rules (`inferRules`, `RegleComputedRules`)
- Typing component props (`InferRegleRoot`, `RegleFieldStatus`)

### `regle-migrate-vuelidate`

Step-by-step migration guide to port Vuelidate forms (`useVuelidate`) to Regle (`useRegle` / `useScopedRegle`), covering imports, renamed helpers and properties, rules, validation properties, scoped validation, and parent-child form propagation. See [Migrate from Vuelidate](/introduction/migrate-from-vuelidate).
