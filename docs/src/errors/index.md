---
title: Error reference
description: Regle diagnostic codes and how to fix them
---

# Error reference

Stable diagnostic codes emitted by Regle in development. Each code links to a page with context and fixes.

## Runtime

| Code | Level | Title |
|------|-------|-------|
| [REGLE_R0001](/errors/r0001) | error | Rule active callback threw |
| [REGLE_R0002](/errors/r0002) | error | Rule message or tooltip callback threw |
| [REGLE_R0003](/errors/r0003) | error | Incorrect rule format |
| [REGLE_R0004](/errors/r0004) | warn | Async validator on sync rule |
| [REGLE_R0005](/errors/r0005) | warn | Primitive array with $each rules |
| [REGLE_R0006](/errors/r0006) | error | createRule validator must be a function |
| [REGLE_R0007](/errors/r0007) | error | Validator threw during validation |
| [REGLE_R0008](/errors/r0008) | warn | schemaMode without onValidate |
| [REGLE_R0009](/errors/r0009) | warn | createVariant unmatched discriminant |
| [REGLE_R0010](/errors/r0010) | warn | Rules and state shape mismatch |
| [REGLE_R0011](/errors/r0011) | warn | Failed to unwrap rule parameters |
| [REGLE_R0012](/errors/r0012) | warn | customStore resets global scope |
| [REGLE_R0013](/errors/r0013) | warn | Missing rule error message |
| [REGLE_R0014](/errors/r0014) | error | Rule commit failed |
| [REGLE_R0015](/errors/r0015) | error | mergeRegles validation failed |
| [REGLE_R0017](/errors/r0017) | warn | Empty scoped namespace |
| [REGLE_R0018](/errors/r0018) | warn | asRecord without id |
| [REGLE_R0020](/errors/r0020) | warn | Regle Devtools plugin not installed |
| [REGLE_R0021](/errors/r0021) | warn | Async validator without async flag |

## Rules

| Code | Level | Title |
|------|-------|-------|
| [REGLE_R0101](/errors/r0101) | warn | Non-numeric rule parameter |
| [REGLE_R0102](/errors/r0102) | warn | Async validator in sync pipe |
| [REGLE_R0103](/errors/r0103) | error | Invalid rule shape |
| [REGLE_R0104](/errors/r0104) | error | not() inner validator threw |
| [REGLE_R0016](/errors/r0016) | warn | withAsync on createRule rule |
| [REGLE_R0019](/errors/r0019) | warn | Empty and() or or() |

## Schema

| Code | Level | Title |
|------|-------|-------|
| [REGLE_C0001](/errors/c0001) | error | Non Standard Schema library |

## Nuxt

| Code | Level | Title |
|------|-------|-------|
| [REGLE_C0101](/errors/c0101) | error | Nuxt setup file not found |
| [REGLE_C0102](/errors/c0102) | error | Pinia skipHydrate import failed |
| [REGLE_C0103](/errors/c0103) | error | @regle/schemas not installed |

