---
title: Integrations
---

# Integrations


## Nuxt

Adding Nuxt module will provide auto-imports for selected exports

Run this command into your nuxt app

```bash [nuxt]
npx nuxi module add regle
```

This exports will become globally available in your nuxt app

- `@regle/core`
  - useRegle 
  - createRule
  - defineRegleConfig
- `@regle/rules` Built-in rules are not injected to reduce risk of name conflict
  - ruleHelpers
  - withAsync
  - withMessage
  - withParams
- `@regle/zod` (if present)
  - useZodRegle