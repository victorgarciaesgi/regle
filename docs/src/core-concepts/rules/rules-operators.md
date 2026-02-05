---
title: Rules operators
description: Regle provides tools to combine and operate on different rules
---

<script setup>
import OperatorAnd from '../../parts/components/operators/OperatorAnd.vue';
import OperatorOr from '../../parts/components/operators/OperatorOr.vue';
import OperatorXor from '../../parts/components/operators/OperatorXor.vue';
import OperatorNot from '../../parts/components/operators/OperatorNot.vue';
import OperatorApplyIf from '../../parts/components/operators/OperatorApplyIf.vue';
import OperatorAssignIf from '../../parts/components/operators/OperatorAssignIf.vue';
import OperatorPipe from '../../parts/components/operators/OperatorPipe.vue';
import OperatorPipeAsync from '../../parts/components/operators/OperatorPipeAsync.vue';
</script>


# Rules operators

Regle provides tools to combine and operate on different rules. It includes the following built-in operators, available in `@regle/rules`:

- `and`
- `or`
- `xor`
- `not`
- `applyIf`
- `assignIf`
- `pipe`

These operators work with any rules you provide, but combining rules with incompatible input types may lead to errors.

:::tip
All operators are compatible with wrappers
:::


## `and`

The `and` operator combines multiple rules and validates successfully only if all provided rules are valid.


```ts
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


## `xor`

The `xor` operator (exclusive or) validates successfully if **exactly one** of the provided rules is valid. It fails when none or more than one rule passes.

```ts
import { useRegle } from '@regle/core';
import { xor, contains, withMessage } from '@regle/rules';

const { r$ } = useRegle(
  { code: '' },
  {
    code: {
      myError: withMessage(
        xor(contains('A'), contains('B')),
        ({ $params: [charA, charB] }) =>
          `Field should contain either "${charA}" or "${charB}", but not both`
      ),
    },
  }
);
```

Result: 

<OperatorXor />


## `not`

The `not` operator passes when the provided rule fails and fails when the rule passes. It can be combined with other rules.

```ts
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
      'Your passwords must be different'
    ),
  },
});
```

Result: 

<OperatorNot />


## `applyIf`

The `applyIf` operator is similar to `requiredIf`, but it can be used with any rule. It simplifies conditional rule declarations.

```ts
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


```ts
import { required, email, minLength, assignIf } from '@regle/rules';

const condition = ref(false);

const { r$ } = useRegle(ref({ name: '', email: '' }), {
  name: assignIf(condition, { required, minLength: minLength(4) }),
  email: { email },
});
```

Result: 

<OperatorAssignIf />


## `pipe`

The `pipe` operator chains multiple rules together sequentially. Each rule only runs if all previous rules have passed. This is useful when you want to validate in a specific order and avoid running expensive validations (like async checks) until simpler ones pass.

```ts
import { useRegle } from '@regle/core';
import { pipe, required, minLength, email } from '@regle/rules';

const { r$ } = useRegle(
  { email: '' },
  {
    email: pipe(required, minLength(5), email),
  }
);
// minLength only runs if required passes
// email only runs if both required and minLength pass
```

Result: 

<OperatorPipe />

:::tip When to use `pipe` vs `and`
- Use **`and`** when all rules should run simultaneously and you want all errors at once
- Use **`pipe`** when rules should run sequentially and later rules depend on earlier ones passing (e.g., don't check email format until the field has enough characters)
:::

The `pipe` operator also works with async rules. Subsequent rules will wait for async validators to complete before running:

```ts
import { pipe, required, withAsync } from '@regle/rules';

const checkEmailAvailable = withAsync(async (value) => {
  const response = await fetch(`/api/check-email?email=${value}`);
  return response.ok;
});

const { r$ } = useRegle(
  { email: '' },
  {
    email: pipe(required, email, checkEmailAvailable),
  }
);
// checkEmailAvailable only runs after required and email pass
```

### Debouncing async validators

When using `pipe` with async validators, you can configure a debounce delay to prevent too many API calls while the user is typing. Use the array syntax with an options object as the second argument:


```ts
import { pipe, required, email, withAsync } from '@regle/rules';

const checkEmailAvailable = withAsync(async (value) => {
  const response = await fetch(`/api/check-email?email=${value}`);
  return response.ok;
});

const { r$ } = useRegle(
  { email: '' },
  {
    email: pipe(
      [required, email, checkEmailAvailable],
      { debounce: 300 } // Wait 300ms after last input before running async validators
    ),
  }
);
```

Result:

<OperatorPipeAsync />

The debounce option only affects async validators in the pipe. Synchronous validators (`required`, `email` in the example above) run immediately, while the async validator (`checkEmailAvailable`) will be debounced.

:::info Default debounce
When using `pipe` with async validators, the default debounce delay is **200ms**. You can override this by passing a custom `debounce` value in the options.
:::
