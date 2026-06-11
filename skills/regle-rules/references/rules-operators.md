# Rule Operators

Operators combine and transform rules. All are exported from `@regle/rules` and compatible with wrappers.

## `and`

Valid only if **all** rules pass:

```ts
import { and, startsWith, endsWith, withMessage } from '@regle/rules';

const { r$ } = useRegle({ regex: '' }, {
  regex: {
    valid: withMessage(
      and(startsWith('^'), endsWith('$')),
      ({ $params: [start, end] }) => `Must start with "${start}" and end with "${end}"`
    ),
  },
});
```

## `or`

Valid if **at least one** rule passes:

```ts
import { or, startsWith, endsWith } from '@regle/rules';

{ field: { rule: or(startsWith('^'), endsWith('$')) } }
```

## `xor`

Valid if **exactly one** rule passes:

```ts
import { xor, contains } from '@regle/rules';

{ code: { rule: xor(contains('A'), contains('B')) } }
```

## `not`

Inverts a rule -- passes when the rule fails:

```ts
import { not, sameAs, withMessage } from '@regle/rules';

const form = ref({ oldPassword: '', newPassword: '' });

const { r$ } = useRegle(form, {
  newPassword: {
    notSame: withMessage(
      not(sameAs(() => form.value.oldPassword)),
      'Passwords must be different'
    ),
  },
});
```

## `applyIf`

Conditionally apply a rule:

```ts
import { applyIf, minLength } from '@regle/rules';

const condition = ref(false);

{ name: { minLength: applyIf(condition, minLength(6)) } }
```

## `assignIf`

Conditionally apply **multiple** rules to a field:

```ts
import { assignIf, required, minLength } from '@regle/rules';

const condition = ref(false);

{ name: assignIf(condition, { required, minLength: minLength(4) }) }
```

## `pipe`

Chain rules sequentially -- each runs only if all previous pass:

```ts
import { pipe, required, minLength, email } from '@regle/rules';

{ email: pipe(required, minLength(5), email) }
// minLength only runs if required passes
// email only runs if both pass
```

### `pipe` with async and debounce

```ts
import { pipe, required, email, withAsync } from '@regle/rules';

const checkAvailable = withAsync(async (value) => {
  const res = await fetch(`/api/check?email=${value}`);
  return res.ok;
});

{
  email: pipe(
    [required, email, checkAvailable],
    { debounce: 300 } // only affects async validators
  ),
}
```

### `pipe` vs `and`

- **`and`**: all rules run simultaneously, all errors shown at once
- **`pipe`**: sequential, later rules only run if earlier ones pass
