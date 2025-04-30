---
title: Infer state from rules
description: Write your validations in the Zod way
---

# Infer state from rules

Regle is state first, that means that you write your rules depending on the state structure, that's the model based way that Vuelidate introduced.

With Schema libraries like Zod or Valibot, it's the contrary: the state type depends on the schema output.

This mental model may differ to some people, the good new is Regle allow to work both ways!

## `InferInput`

`InferInput` is an utility type that can produce a object state from any rules object.

It will try to extract the possible state type that a rule may have, prioritizing rules that have a strict input type.

Some rules may have `unknown` type because it could apply to any value. To cover this, there is now type-helpers rules to help you type your state from the rules: `type`, `string`, `number`, `boolean`, `date`.

:::info
Some types like `numeric` will feel weird as it's typed `string | number`, it's normal as the rule can also validate numeric strings. You can enforce the type by applying `number` rule to it.
:::

```ts twoslash
import {ref} from 'vue';
// ---cut---
import { defineRules, type InferInput} from '@regle/core';
import { required, string, numeric, type } from '@regle/rules';

/* defineRules is not required, but it helps you catch errors in structure */
const rules = defineRules({
  firstName: { required, string },
  count: { numeric },
  enforceType: { required, type: type<'FOO' | 'BAR'>()}
})

type State = InferInput<typeof rules>;
//     ^?

```

<br/>
<br/>
<br/>

## `refineRules`

Regle is state first because in real world forms, rules can depend a state values.   
This make it a problem for dynamic rules as it would make a cyclic type error when trying to use the state inside the rules.

To cover this case and inspired by Zod's `refine`, Regle provides a `refineRules` helper to write dynamic rules that depend on the state, while making it possible to access a typed state.


Anything returned by the rule refine function will override what's defined in the default rules.

```ts twoslash
import {ref} from 'vue';
// ---cut---
import { refineRules, type InferInput} from '@regle/core';
import { required, string, sameAs } from '@regle/rules';

const rules = refineRules({
  password: { required, string },
}, 
 (state) => ({
   confirmPassword: { required, sameAs: sameAs(() => state.value.password) }
 })
)

type State = InferInput<typeof rules>;
//     ^?
```


