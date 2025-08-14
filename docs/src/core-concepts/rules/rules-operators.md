---
title: Rules operators
description: Regle provides tools to combine and operate on different rules
---

<script setup>
import OperatorAnd from '../../parts/components/operators/OperatorAnd.vue';
import OperatorOr from '../../parts/components/operators/OperatorOr.vue';
import OperatorNot from '../../parts/components/operators/OperatorNot.vue';
import OperatorApplyIf from '../../parts/components/operators/OperatorApplyIf.vue';
</script>


# Rules operators

Regle provides tools to combine and operate on different rules. It includes four built-in operators, available in `@regle/rules`:

- `and`
- `or`
- `not`
- `applyIf`
- `assignIf`

These operators work with any rules you provide, but combining rules with incompatible input types may lead to errors.

:::tip
All operators are compatible with wrappers
:::


## `and`

The `and` operator combines multiple rules and validates successfully only if all provided rules are valid.


```ts twoslash
import { useRegle } from '@regle/core';
import { and, startsWith, endsWith, withMessage } from '@regle/rules';

const { r$ } = useRegle(
  { regex: '' },
  {
    regex: {
      myError: withMessage(
        and(startsWith('^'), endsWith('$')),
        ({ $params: [start, end] }) =>
          `Regex should start with "${start}" and end with "${end}"`
      ),
    },
  }
);
```

Result: 

<OperatorAnd />


## `or`

The `or` operator validates successfully if at least one of the provided rules is valid.


```ts twoslash
import { useRegle } from '@regle/core';
import { or, startsWith, endsWith, withMessage } from '@regle/rules';

const { r$ } = useRegle(
  { regex: '' },
  {
    regex: {
      myError: withMessage(
        or(startsWith('^'), endsWith('$')),
        ({ $params: [start, end] }) =>
          `Field should start with "${start}" or end with "${end}"`
      ),
    },
  }
);
```

Result: 

<OperatorOr />


## `not`

The `not` operator passes when the provided rule fails and fails when the rule passes. It can be combined with other rules.

```ts twoslash
import { useRegle } from '@regle/core';
import { not, required, sameAs, withMessage } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ oldPassword: '', newPassword: '' });
const { r$ } = useRegle(form, {
  oldPassword: {
    required,
  },
  newPassword: {
    notEqual: withMessage(
      not(sameAs(() => form.value.oldPassword)),
      'Your confirm new password must not be the same as your old password'
    ),
  },
});
```

Result: 

<OperatorNot />


## `applyIf`

The `applyIf` operator is similar to `requiredIf`, but it can be used with any rule. It simplifies conditional rule declarations.

```ts twoslash
import { useRegle } from '@regle/core';
import { ref } from 'vue';
// ---cut---
import { minLength, applyIf } from '@regle/rules';

const condition = ref(false);

const { r$ } = useRegle({name: ''}, {
  name: {
    minLength: applyIf(condition, minLength(6))
  },
});
```

<OperatorApplyIf />


## `assignIf`

The `assignIf` is a shorthand for conditional destructuring assignment.
It allows to apply multiple rules to a field conditionally.


```ts twoslash
import { useRegle } from '@regle/core';
import { ref } from 'vue';
// ---cut---
import { required, email, minLength, assignIf } from '@regle/rules';

const condition = ref(false);

const { r$ } = useRegle(ref({ name: '', email: '' }), {
  name: assignIf(condition, { required, minLength: minLength(4) }),
  email: { email },
});
```
