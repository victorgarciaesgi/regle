# Rule Wrappers

Wrappers customize or enhance rules by injecting or replacing properties.

## `withMessage`

Associate an error message with any rule:

```ts
import { withMessage } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: {
    // Static message
    rule1: withMessage((value) => !!value, 'Custom error'),
    // Dynamic message with value and metadata
    rule2: withMessage(
      (value) => ({ $valid: value === 'regle', foo: 'bar' }),
      ({ $value, foo }) => `Error: ${$value} (${foo})`
    ),
  },
});
```

Errors appear in `r$.$errors.name` and `r$.name.$errors`.

## `withParams`

Track external reactive dependencies manually:

```ts
import { withParams } from '@regle/rules';

const base = ref('foo');

const { r$ } = useRegle({ name: '' }, {
  name: {
    customRule: withParams(
      (value, param) => value === param,
      [base]  // or [() => base.value]
    ),
  },
});
```

Use `withParams` when dependencies can't be tracked automatically (e.g., inline rules not in a getter/computed).

## `withAsync`

Like `withParams` but for async rules with external dependencies:

```ts
import { withAsync } from '@regle/rules';

const base = ref('foo');

const { r$ } = useRegle({ name: '' }, {
  name: {
    asyncRule: withAsync(
      async (value, param) => await someAsyncCall(param),
      [base]
    ),
  },
});
```

## `withTooltip`

Display non-error messages via `$tooltips`:

```ts
import { withTooltip } from '@regle/rules';

const { r$ } = useRegle({ password: '' }, {
  password: {
    strength: withTooltip(
      (value) => value.length > 8,
      'Password should be at least 8 characters'
    ),
  },
});
// Access: r$.password.$tooltips
```

## Chaining wrappers

Combine multiple wrappers:

```ts
import { withAsync, withMessage } from '@regle/rules';

const base = ref(1);

const { r$ } = useRegle({ name: '' }, {
  name: {
    customRule: withMessage(
      withAsync(
        async (value, param) => await someAsyncCall(param),
        [base]
      ),
      ({ $value, $params: [param] }) => `Error: ${$value} != ${param}`
    ),
  },
});
```
