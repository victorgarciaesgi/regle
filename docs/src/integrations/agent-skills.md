---
title: Agent Skills
description: Install Regle Agent Skills for your AI coding agent
---

# Agent Skills

[Agent Skills](https://skills.sh/) are reusable capabilities for AI coding agents. They provide procedural knowledge that helps agents write Regle validation code more effectively.

Regle provides three skills covering core usage, advanced patterns, and TypeScript integration.

## Install

```bash
npx skills add victorgarciaesgi/regle
```

This installs all three Regle skills and configures them for your AI agent.

## Available skills

### `regle`

Core Regle usage:

- `useRegle` composable (state, rules, `r$` object)
- Built-in validation rules (`required`, `email`, `minLength`, etc.)
- Validation properties (`$invalid`, `$dirty`, `$error`, `$errors`, `$pending`)
- Displaying errors (`getErrors`, `flatErrors`)
- Modifiers (`autoDirty`, `lazy`, `silent`, `rewardEarly`, `validationGroups`)
- Custom rules (`createRule`, inline rules, async rules)
- Rule wrappers (`withMessage`, `withParams`, `withAsync`, `withTooltip`)
- Rule operators (`and`, `or`, `not`, `pipe`, `applyIf`)

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
- Schema libraries (`useRegleSchema` with Zod, Valibot, ArkType)
- Standard Schema spec (`useRules`, `refineRules`, `InferInput`)

### `regle-typescript`

TypeScript integration:

- Type-safe output (`$validate` return type, `InferSafeOutput`)
- Typing rules (`inferRules`, `RegleComputedRules`)
- Typing component props (`InferRegleRoot`, `RegleFieldStatus`)
