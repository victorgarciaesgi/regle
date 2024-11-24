---
title: Rules operators
---

<script setup>
import OperatorAnd from '../parts/components/operators/OperatorAnd.vue';
import OperatorOr from '../parts/components/operators/OperatorOr.vue';
import OperatorNot from '../parts/components/operators/OperatorNot.vue';
import OperatorApplyIf from '../parts/components/operators/OperatorApplyIf.vue';
</script>


# Rules operators

Regle provides a way to make operations between different rules.
Regle has 4 built-in operators for you to work with, available in `@regle/rules`.

- `and`
- `or`
- `not`
- `applyIf`

They work with any rule you provide, in the limit of what the rule can do, mixing different rules that does not have the same input type can break.

:::tip
All operators are compatible with `withMessage`, `withAsync` or `withParams`
:::


## `and`

`and` will merge the validators of multiple rules you give as params. It will only be valid if all the rules are valid


```ts twoslash
import { useRegle } from '@regle/core';
import { and, startsWith, endsWith, withMessage } from '@regle/rules';

const { state, errors, regle, resetAll } = useRegle(
  { regex: '' },
  {
    regex: {
      myError: withMessage(
        and(startsWith('^'), endsWith('$')),
        (value, { $params: [start, end] }) =>
          `Field should start with "${start}" and end with "${end}"`
      ),
    },
  }
);
```

Result: 

<OperatorAnd/>


## `or`

`or` takes multiple rules when at least one of the provided rules is valid.


```ts twoslash
import { useRegle } from '@regle/core';
import { or, startsWith, endsWith, withMessage } from '@regle/rules';

const { state, errors, regle, resetAll } = useRegle(
  { regex: '' },
  {
    regex: {
      myError: withMessage(
        or(startsWith('^'), endsWith('$')),
        (value, { $params: [start, end] }) =>
          `Field should start with "${start}" or end with "${end}"`
      ),
    },
  }
);
```

Result: 

<OperatorOr/>


## `not`

Passes when provided rule would not pass, fails otherwise. Can be chained with other rules.

```ts twoslash
import { useRegle } from '@regle/core';
import { not, required, sameAs, withMessage } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ password: '', confirm: '' });
const { state, errors, regle, resetAll } = useRegle(form, {
  password: {
    required,
  },
  confirm: {
    notEqual: withMessage(
      not(sameAs(() => form.value.password)),
      'Your confirm password must not be the same as your password'
    ),
  },
});
```

Result: 

<OperatorNot/>


## `applyIf`

`applyIf` is like `requiredIf`, but usable for any rule. It's easier that to do spread conditions in the rules declaration.


```ts twoslash
import { useRegle } from '@regle/core';
import { minLength, applyIf } from '@regle/rules';
import { ref } from 'vue';

const condition = ref(false);

const form = ref({name: ''});

const { state, errors, regle, resetAll } = useRegle(form, {
  name: {
    minLength: applyIf(condition, minLength(6))
  },
});
```

<OperatorApplyIf/>