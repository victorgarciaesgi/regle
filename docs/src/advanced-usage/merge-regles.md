---
title: Merge multiple Regles
---

<script setup>
import MergeReglesBasic from '../parts/components/merge-regles/MergeReglesBasic.vue';
</script>

# Merge multiple Regles

If you need to combine multiple Regle instances into one, it's possible with the `mergeRegles` helper.

## When to use

`mergeRegles` is useful when:
- You have forms split across multiple components and need to validate them together
- You want to compose smaller, reusable form sections into a larger form
- Different parts of your form have different validation lifecycles but need unified submission

## Basic usage

The helper returns an output similar to the main `r$`, while still being able to call `$touch`, `$validate`, or `$reset` on all merged instances at once.

All types are preserved, giving you full autocomplete support.

```ts twoslash
import {required, numeric, email} from '@regle/rules';
// ---cut---
// @noErrors
import { mergeRegles, useRegle } from '@regle/core';

const { r$ } = useRegle({email: ''}, {
  email: { required, email },
});

const { r$: otherR$ } = useRegle({firstName: ''}, {
  firstName: { required },
});

const r$Merged = mergeRegles({ r$, otherR$ });

r$Merged.$value.otherR$.
//                      ^|


```

Result:

<MergeReglesBasic />

## Accessing merged data

You can access each merged instance's data through the merged object:

```ts
// Access values
r$Merged.$value.r$.email
r$Merged.$value.otherR$.firstName

// Access validation states
r$Merged.r$.email.$valid
r$Merged.otherR$.firstName.$error

// Access errors
r$Merged.$errors.r$.email
r$Merged.$errors.otherR$.firstName
```

## Global operations

The merged instance exposes global methods that operate on all child instances:

```ts
// Validate all merged forms
await r$Merged.$validate()

// Reset all merged forms
r$Merged.$reset({ toInitialState: true })

// Touch all fields
r$Merged.$touch()
```

:::tip
The merged instance's `$valid`, `$error`, and `$pending` properties reflect the combined state of all child instances.
:::